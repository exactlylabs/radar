#!/usr/bin/env bash

####################################################
#
#  Update an Update Group's versions
#
####################################################

set -e

function usage() {
  echo "Usage: $0  [OPTIONS] <update_group_id> <api_token>"
  echo "Required Arguments:"
  echo "  update_group_id: The Update Group ID to update"
  echo "  api_token: The API Token to use"
  echo "Options:"
  echo "  -s or --server-url: Radar Server URL [default: https://pods.radartoolkit.com]"
  echo "  -a or --agent-version-id: Agent Version ID to use"
  echo "  -w or --watchdog-version-id: Watchdog Version ID to use"
  exit 1
}

while :; do
    case $1 in
        -h|--help)
            usage
            exit 0
        ;;
        -s|--server-url)
            RADAR_URL=$2
            shift
        ;;
        -a|--agent-version-id)
            AGENT_ID=$2
            shift
        ;;
        -w|--watchdog-version-id)
            WATCHDOG_ID=$2
            shift
        ;;
        *) break
    esac
    shift
done



if [ -z ${RADAR_URL} ];then
  RADAR_URL="https://pods.radartoolkit.com"
fi

if [ -z $1 ]; then
  echo "Error: Missing Update Group ID argument"
  usage
  exit 1
fi

if [ -z $2 ]; then
  echo "Error: Missing API Token argument"
  usage
  exit 1
fi

UPDATE_GROUP_ID=$1
API_TOKEN=$2

# Obtain the latest versions

function firstID() {
  ENDPOINT=$1
  RES=$(curl -s \
    -H "Authorization: Token $API_TOKEN" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    $RADAR_URL/$ENDPOINT)

  echo $(echo $RES | jq -r '.results[0].id')
}

if [ -z $AGENT_ID ];then
  AGENT_ID=$(firstID "api/v1/client_versions")
fi

if [ -z $WATCHDOG_ID ];then
  WATCHDOG_ID=$(firstID "api/v1/watchdog_versions")
fi


# Update the Update Group

echo $(curl -s \
  -H "Authorization: Token $API_TOKEN" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -X PUT \
    -d "{\"client_version_id\": $AGENT_ID, \"watchdog_version_id\": $WATCHDOG_ID}" \
    $RADAR_URL/api/v1/update_groups/$UPDATE_GROUP_ID
)
