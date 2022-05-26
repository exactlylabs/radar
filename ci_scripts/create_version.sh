#!/usr/bin/env bash

AUTH="Basic $(echo -n $RADAR_USER:$RADAR_PASSWORD | base64)"
STATUS_CODE=$(curl -s -X POST \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: '"$AUTH"'' \
  -d '{"version": "'"$VERSION"'"}' \
  --output /dev/stderr \
  --write-out '%{http_code}' \
  $RADAR_URL/api/v1/client_versions)


if [[ $STATUS_CODE -ne 201 && $STATUS_CODE -ne 303 ]]; then
  echo "request failed with status: $STATUS_CODE"
  exit 1
fi
