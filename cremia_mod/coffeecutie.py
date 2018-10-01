#!/usr/bin/python3

from multiprocessing import Process
from subprocess import Popen
from flask import request, current_app as app
from json import dumps

from cremia_mod.globals import *
from cremia_mod.common import bash_extract, bash_run, sha_eval, git_eval, Entity
from cremia_mod.gh_hook import GitHubHook


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
BUILD_MODE=bare ./cb quick-build docs''' % (CREMIA_GIT_DIR, branch_name, branch_name, branch_name)])
    CREMIA_QUEUE.append(proc)


# Specialized event, pulling emscripten binaries from recent release
# It proceeds to upload it to the live examples page
def handle_new_build(commit, status_info):
    if not sha_eval(commit['sha']) or not CREMIA_GHB_KEY:
        app.logger.debug('No GitHub key')
        return

    app.logger.debug('Starting example update')

    gh_py = 'python3 %s/toolchain/ci/github_api.py' % CREMIA_GIT_DIR

    query_base = '%s --api-token %s' % (gh_py, CREMIA_GHB_KEY)

    query = '''\
%s list tag %s %s | cut -d'|' -f 2
''' % (query_base, CREMIA_GIT_BLOB, commit['sha'])

    tag = bash_run(query)
    if len(tag) == 0:
        app.logger.debug('Failed to look up tag')
        return

    tag = bash_extract(tag)

    asset_id = bash_run('''%s list asset %s:%s | grep binaries_emscripten.wasm | cut -d'|' -f 3 ''' % (
    query_base, CREMIA_GIT_BLOB, tag))

    asset_id = bash_extract(asset_id)

    if len(asset_id) == 0:
        app.logger.debug('Failed to look up asset')
        return

    out = bash_run(
        '''%s pull asset %s %s && tar xf binaries_emscripten.wasm.tar.gz && rm binaries_emscripten.wasm.tar.gz && rm -r nginx-www/emscripten.wasm && mv -f build/emscripten.wasm nginx-www/''' % (
        query_base, CREMIA_GIT_BLOB, asset_id))

    app.logger.debug(out)
    with open('nginx-www/emscripten.wasm/bin/.update-info.json', mode='w') as f:
        f.write(dumps(status_info))
        app.logger.debug('Example update process finished')


class Processor(GitHubHook):
    def __init__(self):
        super().__init__()

    def filter(self, **kwargs):
        return super().filter(**kwargs) and self.ensure_repo('hbirchtree/coffeecutie', **kwargs)

    def events(self):
        return ['push', 'status', 'release']

    def __call__(self, evname, body):
        global RECENT_RELEASE_HANDLER
        if evname == 'push' and request.is_json and 'ref' in request.json:
            branch_name = git_eval(request.json['ref'])
            if branch_name is not None:
                app.logger.debug('Branch %s pushed', branch_name)
                handle_push(branch_name)
            else:
                app.logger.debug('Branch check: %s', branch_name)
        elif evname == 'status':
            app.logger.debug('Build status: %s', request.json)
            if 'state' in request.json and 'context' in request.json:
                if request.json['state'] == 'success' and \
                        request.json['context'].startswith('continuous-integration/travis-ci/'):
                    if RECENT_RELEASE_HANDLER is not None:
                        if RECENT_RELEASE_HANDLER.is_alive():
                            RECENT_RELEASE_HANDLER.terminate()
                            app.logger.debug('terminating earlier task')
                        else:
                            RECENT_RELEASE_HANDLER.join()

                    RECENT_RELEASE_HANDLER = Process(target=handle_new_build,
                                                     args=(request.json['commit'], request.json))
                    RECENT_RELEASE_HANDLER.start()
                else:
                    app.logger.debug('state or context mismatch')
            else:
                app.logger.debug('missing state and/or context')

        elif evname == 'release':
            app.logger.debug('Release: %s', request.json)
            with open('nginx-www/github.cached/.latest-release.json', mode='w') as f:
                f.write(dumps(request.json))
        else:
            app.logger.debug('Event ignored\n%s %s\n%s', evname, request, request.headers)
            return Entity({'error': 'mismatched payload'}, 400)

        return Entity({'message': 'OK'}, 200)
