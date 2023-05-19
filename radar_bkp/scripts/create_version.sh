#!/usr/bin/env bash

#
# ----------------------------------------------------------------------- #
# Name: Create Version
#
# Description: 
#   Creates a version on radar server.
#
# Variables:
#  * VERSION: The version to create (format: <major>.<minor>.<patch>)
#  * RADAR_URL: URL for Radar Server
#  * RADAR_USER: Username to log in on Radar Server
#  * RADAR_PASSWORD: Password to log in on Radar Server
#
# ----------------------------------------------------------------------- #

AUTH="Token ${RADAR_TOKEN}"
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
