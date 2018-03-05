#!/bin/bash

# Do this to avoid locale errors
unset LC_MESSAGES
unset LC_COLLATE
unset LC_CTYPE

# Update repositories, get some packages
apt-get -qy update
apt-get -qy install apt-transport-https ca-certificates curl software-properties-common python3-pip tmux

# Add Docker and Certbot repositories
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
add-apt-repository ppa:certbot/certbot

# Install said packages
apt-get -q update
apt-get -qy install docker.io certbot

# Create Kafei contained user
adduser kafei \
    --home /home/kafei \
    --uid 1000 \
    --disabled-password \
    --gecos ""

# Add user to `docker` group
usermod -a -G docker -G sudo kafei

# Clone repository and start containers
su -c 'if [ ! $(grep .local ~/.bashrc) ]; then echo \'PATH=$PATH:~/.local/bin\' >> ~/.bashrc; fi'
su -c 'cd ~ && git clone https://github.com/hbirchtree/kafei-py.git && cd kafei-py && pip3 install -r requirements.txt' kafei

# The steps below here cannot be done automatically

# Get certificates and start the servers
#
#   bash /home/kafei/kafei-py/get-certs.sh
#   su -c 'cd ~/kafei-py && docker-compose up -d' kafei
#
