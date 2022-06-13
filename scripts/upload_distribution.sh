#!/usr/bin/env bash
#
# ----------------------------------------------------------------------- #
# Name: Upload Distribution
#
# Description: 
#   Uploads the generated binary and signed binary 
#     as a distribution on the radar server
#
# Variables:
#  * VERSION: The version to create (format: <major>.<minor>.<patch>)
#  * DIST_NAME: Name of this distribution (format: <os>-<arch>)
#  * OUTPUT_PATH: Path to the agent binary
#  * RADAR_URL: URL for Radar Server
#  * RADAR_USER: Username to log in on Radar Server
#  * RADAR_PASSWORD: Password to log in on Radar Server
#
# ----------------------------------------------------------------------- #

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
