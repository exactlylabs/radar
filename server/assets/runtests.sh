#!/usr/bin/env bash

set -e

API_ENDPOINT_URL=https://radarapi.exactlylabs.com

cd /home/radar

. /home/radar/client.conf

./speedtest -f json --accept-license > ookla.json
OOKLA_BLOB_ID=$(curl -XPOST -F 'file=@/home/radar/ookla.json' $API_ENDPOINT_URL/blobs | jq -r .id)
curl -XPOST $API_ENDPOINT_URL/record -d "clientId=$CLIENT_ID&clientSecret=$CLIENT_SECRET&measurementBlobId=$OOKLA_BLOB_ID&measurementType=ookla"
rm ookla.json

./ndt7 -format json > ndt7.json
NDT_BLOB_ID=$(curl -XPOST -F 'file=@/home/radar/ndt7.json' $API_ENDPOINT_URL/blobs | jq -r .id)
curl -XPOST $API_ENDPOINT_URL/record -d "clientId=$CLIENT_ID&clientSecret=$CLIENT_SECRET&measurementBlobId=$NDT_BLOB_ID&measurementType=ndt7"
rm ndt7.json
