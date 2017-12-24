#!/bin/bash

. $(dirname $0)/kafei_py/bin/activate

export SSL_CERT=$LETSENCRYPT/fullchain.pem
export SSL_KEY=$LETSENCRYPT/privkey.pem

flask $(dirname $0)/kafei.py --host 0.0.0.0 --port 443 $@
