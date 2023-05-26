#!/usr/bin/env bash
#
# ----------------------------------------------------------------------- #
# Name: Upload Watchdog
#
# Usage: ./upload_watchdog.sh VERSION BINARY_FILE_PATH
#  * Note that the BINARY_FILE_PATH should be the path to the non-signed binary
#
# Description: 
#   Uploads the generated watchdog binary and signed binary 
#   to the radar server
#
# Variables:
#  * RADAR_URL: URL for Radar Server
#  * RADAR_TOKEN: Account Token to authenticate to Radar Server
#
# ----------------------------------------------------------------------- #

if [ $# -lt 2 ]; then
  echo "Error: missing variables"
  exit 1
fi

if [ -z "${RADAR_URL}" ]; then
  RADAR_URL=http://127.0.0.1:3000
fi

VERSION=$1
FILE_PATH=$2

AUTH="Token ${RADAR_TOKEN}"
STATUS_CODE=$(curl -s -XPOST \
  -H 'Accept: application/json' \
  -H 'Authorization: '"$AUTH"'' \
  -F version=''"${VERSION}"'' \
  -F binary=@${FILE_PATH} \
  -F signed_binary=@${FILE_PATH}_signed \
  --output /dev/stderr \
  --write-out '%{http_code}' \
  $RADAR_URL/api/v1/watchdog_versions)

if [[ $STATUS_CODE -ne 201 && $STATUS_CODE -ne 303 ]]; then
  echo "request failed with status: $STATUS_CODE"
  exit 1
fi
