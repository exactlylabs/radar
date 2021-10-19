#!/usr/bin/env bash

set -e

API_ENDPOINT_URL=https://radarapi.exactlylabs.com

cd /home/radar

. /home/radar/client.conf

./speedtest -f json --accept-license > ookla.json
curl "$API_ENDPOINT_URL/clients/$CLIENT_ID/measurements" -H 'Accept: application/json' -F "measurement[style]=OOKLA" -F "client_secret=$CLIENT_SECRET" -F 'measurement[result]=@/home/radar/ookla.json'
rm ookla.json

./ndt7 -format json > ndt7.json
curl "$API_ENDPOINT_URL/clients/$CLIENT_ID/measurements" -H 'Accept: application/json' -F "measurement[style]=NDT7" -F "client_secret=$CLIENT_SECRET" -F 'measurement[result]=@/home/radar/ndt7.json'
rm ndt7.json
