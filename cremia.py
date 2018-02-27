#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response
from strap import create_app, bootstrap
from uuid import uuid4
import re
from subprocess import Popen, PIPE
from os import environ
from sys import stderr
from multiprocessing import Process
from json import dumps

import hmac
import hashlib

app = create_app(__name__)

CREMIA_API_KEY = None
CREMIA_GIT_DIR = environ['CREMIA_GIT_DIR']
CREMIA_GIT_BRANCH = environ['CREMIA_GIT_BRANCH']
CREMIA_GHB_KEY = None
CREMIA_GIT_BLOB = 'hbirchtree/coffeecutie'

RECENT_RELEASE_HANDLER = None
RECENT_COMMIT_HANDLER = None

CREMIA_QUEUE = []

try:
    with open('CREMIA_key.txt', 'r') as f:
        CREMIA_API_KEY = f.read()
except FileNotFoundError:
    with open('CREMIA_key.txt', 'w') as f:
        key = uuid4()
        CREMIA_API_KEY = key
        f.write(str(key))

try:
    CREMIA_GHB_KEY = environ['GITHUB_TOKEN']
except KeyError:
    print('-- No GitHub API key provided in $GITHUB_TOKEN')

print('-- Server API key: %s' % CREMIA_API_KEY)

def check_hdr(k):
    if k in request.headers:
        return request.headers[k]
    return ''

evname = 'X-GitHub-Event'

@app.route('/', methods=['GET'])
def shoo():
    return 'Go away'

branch_rgx = re.compile('^refs\/heads\/([A-Za-z][A-Za-z0-9_\/\-\.]*[A-Za-z0-9_\-\.])$')
sha_rgx = re.compile('^[A-Za-z0-9]+$')

def git_eval(ref):
    branch = re.findall(branch_rgx, ref)
    if len(branch) == 0:
        return None
    branch = branch[0]
    if branch.endswith('.lock'):
        return None
    if '..' in branch:
        return None
    return branch

def sha_eval(sha):
    m = re.match(sha_rgx, sha)
    return m.string == sha

def bad_response():
    return make_response(jsonify({'message': 'Get out'}), 417)

def handle_push(branch_name):
    global CREMIA_QUEUE

    if len(CREMIA_QUEUE) > 0:
        for p in CREMIA_QUEUE:
            p.wait()
    CREMIA_QUEUE = []
    proc = Popen(['bash', '-c', '''
cd %s && git checkout %s &&
git pull &&
mkdir -p multi_build/build/docs/docs/%s &&
rm -f multi_build/build/docs/docs/html &&
ln -sf %s multi_build/build/docs/docs/html &&
chown -R anju:anju multi_build/build/docs &&
NODEPLOY=1 ./quick-build.sh docs''' % (CREMIA_GIT_DIR, branch_name, branch_name, branch_name)])
    CREMIA_QUEUE.append(proc)

def bash_run(cmd):
    proc = Popen(['bash', '-c', cmd], stdout=PIPE)
    proc.wait()
    return proc.stdout.read().decode()

def bash_extract(out):
    try:
        return out.split('\n')[0]
    except IndexError:
        return ''

# Specialized event, pulling emscripten binaries from recent release
# It proceeds to upload it to the live examples page
def handle_new_build(commit, status_info):
    if not sha_eval(commit['sha']) or not CREMIA_GHB_KEY:
        return

    print('-- Starting example update')

    gh_py = '%s/tools/ci/github_api.py' % CREMIA_GIT_DIR

    query_base = '%s --api-token %s' % (gh_py, CREMIA_GHB_KEY)

    query = '''\
%s list tag %s %s | cut -d'|' -f 2
''' % (query_base, CREMIA_GIT_BLOB, commit['sha'])

    tag = bash_run(query)
    if len(tag) == 0:
        print('-- Failed to look up tag')
        return

    tag = bash_extract(tag)
    
    asset_id = bash_run('''%s list asset %s:%s | grep binaries_emscripten.wasm | cut -d'|' -f 3 ''' % (query_base, CREMIA_GIT_BLOB, tag))

    asset_id = bash_extract(asset_id)

    if len(asset_id) == 0:
        print('--Failed to look up asset')
        return

    out = bash_run('''%s pull asset %s %s && tar xf binaries_emscripten.wasm.tar.gz && rm binaries_emscripten.wasm.tar.gz && rm -r nginx-www/emscripten.wasm && mv -f build/emscripten.wasm nginx-www/''' % (query_base, CREMIA_GIT_BLOB, asset_id))

    print(out)
    with open('nginx-www/emscripten.wasm/bin/.update-info.json', mode='w') as f:
        f.write(dumps(status_info))
    print('-- Example update process finished')


def process_coffeecutie(evname):
    global RECENT_RELEASE_HANDLER
    if check_hdr(evname) == 'push' and request.is_json and 'ref' in request.json:
        branch_name = git_eval(request.json['ref'])
        if branch_name is not None:
            print('-- Branch %s pushed' % branch_name, file=stderr)
            handle_push(branch_name)
    elif check_hdr(evname) == 'status':
        if 'state' in request.json and 'context' in request.json:
            if request.json['state'] == 'success' and\
                    request.json['context'].startswith('continuous-integration/travis-ci/'):
                if RECENT_RELEASE_HANDLER is not None:
                    if RECENT_RELEASE_HANDLER.is_alive():
                        RECENT_RELEASE_HANDLER.terminate()
                    else:
                        RECENT_RELEASE_HANDLER.join()
                RECENT_RELEASE_HANDLER = Process(target=handle_new_build, args=(request.json['commit'], request.json))
                RECENT_RELEASE_HANDLER.start()

    elif check_hdr(evname) == 'release':
        with open('nginx-www/github.cached/.latest-release.json', mode='w') as f:
            f.write(dumps(request.json))
    elif check_hdr(evname) == 'ping':
        pass
        

def process_sips(evname):
    if check_hdr(evname) == 'push':
        bash_run('cd blog && git pull && hugo')


REPOSITORY_MAPPING = {
    'hbirchtree/coffeecutie': process_coffeecutie,
    'hbirchtree/coffee-sips': process_sips
}


@app.route('/', methods=['POST'])
def receive():

    # Deter outsiders
    if not check_hdr('User-Agent').startswith('GitHub-Hookshot'):
        print('Some loser tried: UA=%s, Event=%s' % (check_hdr('User-Agent'), check_hdr(evname)), file=stderr)
        return bad_response()

    # We verify that the SHA1 digest matches with the payload
    try:
        mac = hmac.new(CREMIA_API_KEY.encode(), msg=request.data, digestmod='sha1')

        digest = mac.hexdigest()
        gh_mod, gh_digest = check_hdr('X-Hub-Signature').split('=')

        if not hmac.compare_digest(str(digest), str(gh_digest)):
            print('-- digest failed', file=stderr)
            return bad_response()
    except:
        print('-- hmac failed', file=stderr)
        return bad_response()

    # Process events
    if check_hdr(evname) != 'ping':
        if not request.is_json or 'repository' not in request.json:
            print('-- data error', file=stderr)
            return bad_response()
        if request.json['repository']['full_name'] in REPOSITORY_MAPPING:
            REPOSITORY_MAPPING[request.json['repository']['full_name']](evname)

    print('-- User agent: %s' % check_hdr('User-Agent'), file=stderr)

    return make_response(jsonify({'message': 'OK'}), 200)
   

bootstrap(app, 'CREMIA')

