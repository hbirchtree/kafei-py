#!/bin/bash

apt update
apt install virtualenv python3

cd $(dirname $0)
virtualenv kafei_py --python $(which python3)
