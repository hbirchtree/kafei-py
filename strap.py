#!/usr/bin/python3

import logging
from logging.handlers import RotatingFileHandler
from flask import Flask
from os import environ

def getenv(k):
    try:
        return environ[k]
    except KeyError:
        return None


def create_app(name):
    app = Flask(name)
    app.config.from_object(name)
    app.config.from_envvar('FLASKR_SETTINGS', silent=True)
    return app


def bootstrap(app, envkey: str):
    try:
        opts = {
          'DEBUG': False,
          'PORT': 443,
          'HOST': '0.0.0.0',
          'CERT': '',
          'KEY': '',
          'PROCS': 1
        }

        # Add a logger
        handler = RotatingFileHandler(
          '%s_app.log' % envkey, maxBytes=10000, backupCount=3)
        logging.getLogger('werkzeug').addHandler(handler)
        logging.getLogger('__name__').addHandler(handler)
        app.logger.addHandler(handler)

        for opt in opts:
            val = getenv('%s_%s' % (envkey, opt))
            if val is not None:
                if type(opts[opt]) == str:
                    opts[opt] = val
                elif type(opts[opt]) == int:
                    opts[opt] = int(val)
                elif type(opts[opt]) == float:
                    opts[opt] = float(val)
                elif type(opts[opt]) == bool:
                    opts[opt] = (val == '1')

        print(opts)

        app.run(host=opts['HOST'], processes=opts['PROCS'],
                port=opts['PORT'], debug=opts['DEBUG'],
                ssl_context=(opts['CERT'], opts['KEY']))
    except Exception as e:
        print(e)
