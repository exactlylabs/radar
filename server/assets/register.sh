#!/usr/bin/env bash

if [ ! -f "$HOME/.ssh/id_rsa" ]; then
  INFO=$(curl -XPOST http://35.225.59.10:5000/register)
  mkdir -p ~/.ssh
  jq -n "$INFO" | jq -r .privateKey > ~/.ssh/id_rsa
  chmod 600 ~/.ssh/id_rsa

  touch ~/radar.sh

  REMOTE_PORT=$(jq -n "$INFO" | jq -r .remoteGatewayPort)
  ENDPOINT_HOST=$(jq -n "$INFO" | jq -r .endpointHost)
  ENDPOINT_PORT=$(jq -n "$INFO" | jq -r .endpointPort)
  CLIENT_ID=$(jq -n "$INFO" | jq -r .clientId)

  echo $CLIENT_ID > ~/radar.config

  echo '#!/usr/bin/env bash' > ~/radar.sh
  echo -e "\n\nssh -o StrictHostKeyChecking=accept-new -R $REMOTE_PORT:localhost:22 -N $CLIENT_ID@$ENDPOINT_HOST\n" >> ~/radar.sh

  chmod +x ~/radar.sh
fi
