#!/bin/bash

. $(dirname $0)/kafei_py/bin/activate

export SSL_CERT=$LETSENCRYPT/fullchain.pem
export SSL_KEY=$LETSENCRYPT/privkey.pem

export FLASK_APP=$(dirname $0)/kafei.py

python3 "$FLASK_APP"
