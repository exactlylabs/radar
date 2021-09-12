#!/usr/bin/env bash

cd /home/radar

CLIENT_ID=$(cat radar.config)

./speedtest -f json --accept-license > ookla.json
OOKLA_BLOB_ID=$(curl -XPOST -F 'file=@/home/radar/ookla.json' http://35.225.59.10:5000/blobs | jq -r .id)
curl -XPOST http://35.225.59.10:5000/record -d "clientId=$CLIENT_ID&measurementBlobId=$OOKLA_BLOB_ID&measurementType=ookla"
rm ookla.json

./ndt7 -format json > ndt7.json
NDT_BLOB_ID=$(curl -XPOST -F 'file=@/home/radar/ndt7.json' http://35.225.59.10:5000/blobs | jq -r .id)
curl -XPOST http://35.225.59.10:5000/record -d "clientId=$CLIENT_ID&measurementBlobId=$NDT_BLOB_ID&measurementType=ndt7"
rm ndt7.json
