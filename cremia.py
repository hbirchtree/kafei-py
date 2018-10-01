#!/usr/bin/python3
from json.decoder import JSONDecodeError

from flask import jsonify, request, make_response
from strap import create_app, bootstrap
import hmac
import importlib

from cremia_mod.common import *
from cremia_mod.globals import *

app = create_app(__name__)

evname = 'X-GitHub-Event'

_REPOSITORY_MAPPING = [
    'cremia_mod.coffeecutie',
    'cremia_mod.sips',
]

REPOSITORY_MAPPING = []

for i, repo_module in enumerate(_REPOSITORY_MAPPING):
    mod = importlib.import_module(repo_module).Processor()
    REPOSITORY_MAPPING.append(mod)

def bad_response():
    return Entity({'message': 'Get out'}, 400)


def entities_to_json(entities):
    return [e.object for e in entities]


def filter_response(entity):
    if entity is None:
        return make_response({'message': 'OK'}, 200)

    if app.debug:
        if type(entity) == list:
            aggregate_response_code = 200
            for sub_entity in entity:
                if sub_entity.status_code >= 400:
                    aggregate_response_code = sub_entity.status_code
            return make_response(jsonify(entities_to_json(entity)), aggregate_response_code)
        else:
            return make_response(jsonify(entity.object), entity.status_code)
    else:
        if entity.status_code >= 400:
            app.logger.debug(entity)
            br = bad_response()
            return make_response(jsonify(br.object, br.status_code))
        else:
            if type(entity) == list:
                aggregate_response_code = 200
                for sub_entity in entity:
                    if sub_entity.status_code >= 400:
                        aggregate_response_code = sub_entity.status_code
                return make_response(jsonify(entities_to_json(entity)), aggregate_response_code)
            else:
                return make_response(jsonify(entity.object), entity.status_code)


def verify_github_hmac():
    if request.host.split(':')[0] == 'localhost':
        return None

    # We verify that the SHA1 digest matches with the payload
    try:
        mac = hmac.new(CREMIA_API_KEY.encode(), msg=request.data, digestmod='sha1')

        digest = mac.hexdigest()
        gh_mod, gh_digest = check_hdr('X-Hub-Signature').split('=')

        if not hmac.compare_digest(str(digest), str(gh_digest)):
            return Entity({'error': 'HMAC digest check failed'}, 403)
    except:
        return Entity({'error': 'exception occurred while checking HMAC'}, 500)

    return None


def client_summary():
    if app.debug:
        app.logger.debug('%s %s\n%s' % (request.user_agent, request.url, request.data))


@app.route('/', methods=['GET'])
def shoo():
    return 'Go away'


@app.route('/', methods=['POST'])
def receive():

    # Deter outsiders
    if not check_hdr('User-Agent').startswith('GitHub-Hookshot'):
        app.logger.debug(
            'Some loser tried: UA=%s, Event=%s'
            % (check_hdr('User-Agent'), check_hdr(evname)))
        return filter_response(bad_response())

    hmac_check = verify_github_hmac()

    if hmac_check is not None:
        return filter_response(hmac_check)

    client_summary()

    repo_responses = []
    event_name = check_hdr(evname)

    # Process events
    try:
        if event_name != 'ping':
            if not request.is_json:
                return filter_response(Entity({'error': 'invalid Content-Type'}, 406))

            if 'repository' not in request.json:
                return filter_response(Entity({'error': 'invalid payload'}, 404))

            repo_name = request.json['repository']['full_name']

            for proc in REPOSITORY_MAPPING:
                if proc.filter(repo_name=repo_name, event=event_name):
                    repo_responses.append(proc(event_name, request.json))

                else:
                    repo_responses.append(Entity({'error': 'failed to map %s' % str(proc.__class__)}, 404))

            repo_responses_out = [r for r in repo_responses if r.status_code < 400]

            if len(repo_responses_out):
                repo_responses = repo_responses_out
    except JSONDecodeError:
        return filter_response(Entity({'error': 'invalid JSON payload'}, 400))

    return filter_response(repo_responses)


bootstrap(app, 'CREMIA')
