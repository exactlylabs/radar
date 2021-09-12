#!/usr/bin/env bash

AUTHORIZED_KEYS_PATH=./authorized_keys
NDT_URL=https://storage.googleapis.com/exactly-public/ndt7

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Must be run as root"
    exit
fi

adduser --disabled-password --gecos "" radar

apt-get update
apt-get upgrade
apt-get install -y jq curl

curl -O https://install.speedtest.net/app/cli/ookla-speedtest-1.0.0-arm-linux.tgz
tar -zxf ookla-speedtest-1.0.0-arm-linux.tgz speedtest
mv speedtest /home/radar

curl -O $NDT_URL
mv ndt7 /home/radar
chmod +x /home/radar/ndt7

mkdir -p /home/radar/.ssh
cp $AUTHORIZED_KEYS_PATH /home/radar/.ssh
chown radar:radar -R /home/radar/.ssh
chown radar:radar /home/radar/ndt7
chown radar:radar /home/radar/speedtest
