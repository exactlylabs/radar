#!/usr/bin/env bash
#
# ----------------------------------------------------------------------- #
# Name: Upload Distribution
#
# Usage: ./upload_distribution.sh VERSION BINARY_FILE_PATH DIST_NAME
#  * Note that the BINARY_FILE_PATH should be the path to the non-signed binary
#
# Description: 
#   Uploads the generated binary and signed binary 
#     as a distribution to the radar server
#
# Variables:
#  * RADAR_URL: URL for Radar Server
#  * RADAR_USER: Username to log in on Radar Server
#  * RADAR_PASSWORD: Password to log in on Radar Server
#
# ----------------------------------------------------------------------- #

if [ $# -lt 3 ]; then
  echo "Error: missing variables"
  exit 1
fi

if [ -z "${RADAR_URL}" ]; then
  RADAR_URL=http://127.0.0.1:3000
fi

VERSION=$1
FILE_PATH=$2
DIST_NAME=$3

AUTH="Basic $(echo -n $RADAR_USER:$RADAR_PASSWORD | base64)"
STATUS_CODE=$(curl -s -XPOST \
  -H 'Accept: application/json' \
  -H 'Authorization: '"$AUTH"'' \
  -F distribution[binary]=@${OUTPUT_PATH} \
  -F distribution[signed_binary]=@${OUTPUT_PATH}_signed \
  -F distribution[name]=$DIST_NAME \
  --output /dev/stderr \
  --write-out '%{http_code}' \
  $RADAR_URL/api/v1/client_versions/$VERSION/distributions)

if [[ $STATUS_CODE -ne 201 && $STATUS_CODE -ne 303 ]]; then
  echo "request failed with status: $STATUS_CODE"
  exit 1
fi
