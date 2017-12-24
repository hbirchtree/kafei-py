#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response, Response
from os import environ as ENV
import ssl

app = Flask(__name__)
app.config.from_object(__name__)

app.config.from_envvar('FLASKR_SETTINGS', silent=True)

def validate_token(token):
    if not token.startswith('token '):
        return False
    return True

def handle_request(req):
    if not req.is_json:
        return (406, 'Invalid Content-Type')
    if not validate_token(req.headers['X-Coffee-Token']):
        return (401, 'Authorization procedure failed')
    return (200, 'OK')


@app.route('/reports', methods=['POST', 'PUT', 'GET'])
def submit_report():
    print(request.headers)

    if request.method == 'GET':
        return jsonify({'message': 'OK'})


    code, msg = handle_request(request)

    print(request.json)

    return make_response(jsonify({'message': msg}), code)

if __name__ == "__main__":
    app.run(host="0.0.0.0",
            ssl_context=(ENV['SSL_CERT'], ENV['SSL_KEY']))

