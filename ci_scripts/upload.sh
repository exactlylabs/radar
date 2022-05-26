#!/usr/bin/env bash

if [[ "$DIST_NAME" == windows-* ]]; then
  if [[ ! "$BIN_NAME" == *.exe ]]; then
    BIN_NAME="${BIN_NAME}.exe"
  fi
fi

AUTH="Basic $(echo -n $RADAR_TEST_USER:$RADAR_TEST_PASSWORD | base64)"
STATUS_CODE=$(curl -s -XPOST \
  -H 'Accept: application/json' \
  -H 'Authorization: '"$AUTH"'' \
  -F distribution[binary]=@agent/dist/$BIN_NAME \
  -F distribution[signed_binary]=@agent/dist/${BIN_NAME}_signed \
  -F distribution[name]=$DIST_NAME \
  --output /dev/stderr \
  --write-out '%{http_code}' \
  $RADAR_URL/api/v1/client_versions/$VERSION/distributions)

if [[ $STATUS_CODE -ne 201 && $STATUS_CODE -ne 303 ]]; then
  echo "request failed with status: $STATUS_CODE"
  exit 1
fi
