#!/usr/bin/env bash

AUTH="Basic $(echo -n $RADAR_TEST_USER:$RADAR_TEST_PASSWORD | base64)"
STATUS_CODE=$(curl -XPOST \
  -H 'Accept: application/json' \
  -H 'Authorization: '"$AUTH"'' \
  -F distribution[binary]=@/tmp/dist/$BIN_NAME \
  -F distribution[signed_binary]=@/tmp/dist/${BIN_NAME}_signed \
  -F distribution[name]=$DIST_NAME \
  --output /dev/stderr \
  --write-out '%{http_code}' \
  $RADAR_URL/api/v1/client_versions/$VERSION/distributions)

if [[ $STATUS_CODE -ne 201 && $STATUS_CODE -ne 303 ]]; then
  echo "request failed with status: $STATUS_CODE"
  exit 1
fi
