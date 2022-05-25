#!/usr/bin/env bash

AUTH="Basic $(echo -n $RADAR_TEST_USER:$RADAR_TEST_PASSWORD | base64)"
curl -XPOST \
  -H 'Accept: application/json' \
  -H 'Authorization: '"$AUTH"'' \
  -F distribution[binary]=@/tmp/dist/$BIN_NAME \
  -F distribution[signed_binary]=@/tmp/dist/${BIN_NAME}_signed \
  -F distribution[name]=$DIST_NAME \
  $RADAR_URL/api/v1/client_versions/$VERSION/distributions