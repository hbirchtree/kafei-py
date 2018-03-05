#!/bin/bash

# Update repositories, get some packages
apt update
apt -y install apt-transport-https ca-certificates curl software-properties-common python3-pip

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

apt update
apt -y install docker.io
apt -y install docker-compose

# Create Kafei contained user
adduser \
    --home /home/kafei \
    --uid 1000 \
    --disabled-password \
    --gecos ""

# Add user to `docker` group
usermod -a -G docker kafei

su -c 'cd ~ && git clone https://github.com/hbirchtree/kafei-py.git' kafei
#su -c 'docker-compose ' kafei
