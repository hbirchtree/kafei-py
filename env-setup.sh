#!/bin/bash

unset LC_MESSAGES
unset LC_COLLATE

cd $(dirname $0)
virtualenv kafei_py --python $(which python3)
. $(dirname $0)/kafei_py/bin/activate

