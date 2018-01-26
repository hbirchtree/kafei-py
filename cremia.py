#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response
from strap import create_app, bootstrap
from uuid import uuid4
import re
from subprocess import Popen
from os import environ

app = create_app(__name__)

CREMIA_API_KEY = None
CREMIA_GIT_DIR = environ['CREMIA_GIT_DIR']
CREMIA_GIT_BRANCH = environ['CREMIA_GIT_BRANCH']

CREMIA_QUEUE = []

try:
    with open('CREMIA_key.txt', 'r') as f:
        CREMIA_API_KEY = f.read()
except FileNotFoundError:
    with open('CREMIA_key.txt', 'w') as f:
        key = uuid4()
        CREMIA_API_KEY = key
        f.write(str(key))

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

def bad_response():
    return make_response(jsonify({'message': 'Get out'}), 417)

@app.route('/', methods=['POST'])
def receive():
    global CREMIA_QUEUE
 
    # Deter outsiders
    if not check_hdr('User-Agent').startswith('GitHub-Hookshot') or\
        check_hdr(evname) not in ['push', 'ping']:
        print('Some loser tried: UA=%s, Event=%s' % (check_hdr('User-Agent'), check_hdr(evname)))
        return bad_response()

    # Process events
    if check_hdr(evname) == 'push' and request.is_json and 'ref' in request.json:
        branch_name = git_eval(request.json['ref'])
        if branch_name is None:
            return bad_response()
        print('-- Branch %s pushed' % branch_name)
        if branch_name == CREMIA_GIT_BRANCH:
            if len(CREMIA_QUEUE) > 0:
                for p in CREMIA_QUEUE:
                    p.wait()
                CREMIA_QUEUE = []
            proc = Popen(['bash', '-c', 'cd %s && git pull && NODEPLOY=1 ./quick-build.sh docs' % (CREMIA_GIT_DIR,)])
            CREMIA_QUEUE.append(proc)
    elif check_hdr(evname) == 'ping':
        pass

    print('-- User agent: %s' % check_hdr('User-Agent'))

    return make_response(jsonify({'message': 'OK'}), 200)
   

bootstrap(app, 'CREMIA')

