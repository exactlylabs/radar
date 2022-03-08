#!/usr/bin/env bash

API_ENDPOINT_URL=https://radar.exactlylabs.com

cd /home/radar

. /home/radar/client.conf

while :
do
  echo "Attempting ping..."

  STATUS=$(curl -XPOST "$API_ENDPOINT_URL/clients/$CLIENT_ID/status" -H 'Accept: application/json' -F "secret=$CLIENT_SECRET")

  echo "Pinged successfully"

  TEST_REQUESTED=$(echo $STATUS | jq -r '.test_requested')

  if [[ "$TEST_REQUESTED" == "true" ]]; then
    echo "Test requested"
    ./runtests.sh
    echo "Test request completed"
  fi

  sleep 30
done
