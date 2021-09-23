#!/usr/bin/env bash

API_ENDPOINT_URL=https://radarapi.exactlylabs.com

cd /home/radar

. /home/radar/client.conf

while :
do
  echo "Attempting tunnel startup..."

  echo "Fetching tunnel config"
  TUNNEL_CONFIG=$(curl -XPOST $API_ENDPOINT_URL/session -d "clientId=$CLIENT_ID&clientSecret=$CLIENT_SECRET")

  PRIVATE_KEY=$(echo $TUNNEL_CONFIG | jq -r .privateKey)
  ENDPOINT_HOST=$(echo $TUNNEL_CONFIG | jq -r .endpointHost)
  ENDPOINT_PORT=$(echo $TUNNEL_CONFIG | jq -r .endpointPort)
  REMOTE_GATEWAY_PORT=$(echo $TUNNEL_CONFIG | jq -r .remoteGatewayPort)
  echo -e "export ENDPOINT_HOST=${ENDPOINT_HOST}\nexport ENDPOINT_PORT=${ENDPOINT_PORT}\nexport REMOTE_GATEWAY_PORT=${REMOTE_GATEWAY_PORT}" > /home/radar/tunnel.conf
  chown radar:radar /home/radar/tunnel.conf

  echo -e "${PRIVATE_KEY}" > /home/radar/.ssh/id_rsa
  chmod 600 /home/radar/.ssh/id_rsa
  chown radar:radar /home/radar/.ssh/id_rsa

  echo "Tunnel starting"
  . /home/radar/tunnel.conf
  ssh -o StrictHostKeyChecking=accept-new -R $REMOTE_GATEWAY_PORT:localhost:22 -N $CLIENT_ID@$ENDPOINT_HOST -p $ENDPOINT_PORT
  echo "Tunnel exited"

  sleep 60
done
