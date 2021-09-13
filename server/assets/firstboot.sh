#!/bin/bash

export PATH=/usr/local/bin:/usr/bin:/bin

set -e

sleep 60

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get -y upgrade

apt-get install -y jq curl unattended-upgrades apt-listchanges

# Setup automatic security patches
echo "APT::Periodic::Update-Package-Lists \"1\";" > /etc/apt/apt.conf.d/20auto-upgrades
echo "APT::Periodic::Unattended-Upgrade \"1\";" >> /etc/apt/apt.conf.d/20auto-upgrades

# Register client:
INFO=$(curl -XPOST http://35.225.59.10:5000/register)
mkdir -p /home/radar/.ssh
jq -n "$INFO" | jq -r .privateKey > /home/radar/.ssh/id_rsa
chmod 600 /home/radar/.ssh/id_rsa
chown radar:radar /home/radar/.ssh/id_rsa

touch /home/radar/radar.sh

REMOTE_PORT=$(jq -n "$INFO" | jq -r .remoteGatewayPort)
ENDPOINT_HOST=$(jq -n "$INFO" | jq -r .endpointHost)
ENDPOINT_PORT=$(jq -n "$INFO" | jq -r .endpointPort)
CLIENT_ID=$(jq -n "$INFO" | jq -r .clientId)

echo $CLIENT_ID > /home/radar/radar.config
chown radar:radar /home/radar/radar.config

echo '#!/usr/bin/env bash' > /home/radar/radar.sh
echo -e "\n\nssh -o StrictHostKeyChecking=accept-new -R $REMOTE_PORT:localhost:22 -N $CLIENT_ID@$ENDPOINT_HOST\n" >> /home/radar/radar.sh

chmod +x /home/radar/radar.sh
chown radar:radar /home/radar/radar.sh

systemctl start remotetunnel
systemctl enable remotetunnel

rm -f /var/spool/cron/crontabs/root
rm -f /root/firstboot.sh
