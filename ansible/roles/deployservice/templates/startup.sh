#!/bin/bash

set -e

export DEPLOYROOT="{{ deployroot }}/{{ appname }}"
export DATAROOT="{{ dataroot }}/{{ appname }}"

cd "${DATAROOT}"

{% for env in env_vars %}
export {{ env.var }}={{ env.value }}
{% endfor %}
#export DB_PASSWORD=$(cat {{ dataroot }}/{{ appname }}/secrets/postgresql)
#export MQTT_PASSWORD=$(cat {{ dataroot }}/{{ appname }}/secrets/mqtt)

if [ -f "${DEPLOYROOT}/requirements.txt" ]; then
    echo " -- Setting up virtualenv for service"
    virtualenv -p python3 "${DATAROOT}/venv"
    source "${DATAROOT}/venv/bin/activate"
    pip install -r "${DEPLOYROOT}/requirements.txt"
    source "${DATAROOT}/venv/bin/activate"
fi

$@

