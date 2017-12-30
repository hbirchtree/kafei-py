#!/bin/bash

. $(dirname $0)/kafei_py/bin/activate

LETSENCRYPT=$(cat $(dirname $0)/config)

echo "-- Using encryption keys in $LETSENCRYPT"

export CREMIA_CERT=$LETSENCRYPT/fullchain.pem
export CREMIA_KEY=$LETSENCRYPT/privkey.pem

export FLASK_APP=$(dirname $0)/cremia.py

python3 "$FLASK_APP"
