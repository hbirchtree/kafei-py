#!/usr/bin/python3

from flask import Flask, jsonify, request
from os import environ as ENV
import ssl

app = Flask(__name__)
app.config.from_object(__name__)

app.config.from_envvar('FLASKR_SETTINGS', silent=True)

@app.route('/reports', methods=['POST', 'PUT'])
def submit_report():
    print(dir(request))
    
    print(request.authorization)
    
    return jsonify({'message': 'OK'})

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True,
            ssl_context=('cert.pem', 'key.pem'))

