#!/bin/bash

cd "{{ dataroot }}/{{ appname }}"

export DB_PASSWORD=$(cat secrets/postgresql)
export MQTT_PASSWORD=$(cat secrets/mqtt)

bash "$@"

