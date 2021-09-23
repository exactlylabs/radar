#!/usr/bin/env bash

set -e

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Must be run as root"
    exit 1
fi

apt-get update
apt-get upgrade
apt-get install -y postgresql unattended-upgrades apt-listchanges
sudo -u postgres createdb radar
sudo -u postgres createuser -s root

echo "APT::Periodic::Update-Package-Lists \"1\";" > /etc/apt/apt.conf.d/20auto-upgrades
echo "APT::Periodic::Unattended-Upgrade \"1\";" >> /etc/apt/apt.conf.d/20auto-upgrades
