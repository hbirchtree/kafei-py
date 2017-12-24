#!/bin/bash

apt -q update
apt -qy install virtualenv python3 python3-pip

export LC_ALL="en_US.UTF-8"
export LC_CTYPE="en_US.UTF-8"
sudo dpkg-reconfigure locales
