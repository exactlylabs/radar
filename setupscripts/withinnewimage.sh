#!/usr/bin/env bash

set -e

apt-get update

apt-get install -y jq curl unattended-upgrades apt-listchanges sudo

# Setup automatic security patches
echo "APT::Periodic::Update-Package-Lists \"1\";" > /etc/apt/apt.conf.d/20auto-upgrades
echo "APT::Periodic::Unattended-Upgrade \"1\";" >> /etc/apt/apt.conf.d/20auto-upgrades

systemctl enable remotetunnel
