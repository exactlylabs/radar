#!/usr/bin/env bash
#
# ----------------------------------------------------------------------- #
# Name: Upload Package
#
# Usage: ./upload_package.sh VERSION FILE_PATH OS ARCH
#
# Description: 
#   Uploads an installer package to the radar server.
#
# Variables:
#  * RADAR_URL: Radar Server URL
#  * RADAR_TOKEN: Account Token to authenticate to Radar Server
#
# ----------------------------------------------------------------------- #

if [ $# -lt 4 ]; then
  echo "Error: missing variables"
  exit 1
fi

if [ -z "${RADAR_URL}" ]; then
  RADAR_URL=http://127.0.0.1:3000
fi

VERSION=$1
FILE_PATH=$2
OS=$3
ARCH=$4
EXTENSION=${FILE_PATH##*.}
echo $RADAR_URL/api/v1/client_versions/$VERSION/packages
AUTH="Token ${RADAR_TOKEN}"
STATUS_CODE=$(curl -s -XPOST \
  -H 'Accept: application/json' \
  -H 'Authorization: '"${AUTH}"'' \
  -F package[file]=@${FILE_PATH} \
  -F package[name]=${EXTENSION}-${ARCH} \
  -F package[os]=${OS} \
  --output /dev/stderr \
  --write-out '%{http_code}' \
  $RADAR_URL/api/v1/client_versions/$VERSION/packages)

if [[ $STATUS_CODE -ne 201 && $STATUS_CODE -ne 303 ]]; then
  echo "request failed with status: $STATUS_CODE"
  exit 1
fi
