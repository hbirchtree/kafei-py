#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response
from strap import create_app, bootstrap
from uuid import uuid4

app = create_app(__name__)

CREMIA_API_KEY = None

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

@app.route('/', methods=['POST'])
def receive():
    if check_hdr(evname) == 'push' and request.is_json:
        print('-- Branch %s pushed' % request.json['ref'])
        
    elif check_hdr(evname) == 'ping':
        pass
    else:
        print(check_hdr(evname))

    print('-- User agent: %s' % check_hdr('User-Agent'))

    return 'OK'
   

bootstrap(app, 'CREMIA')

