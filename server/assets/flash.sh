#!/usr/bin/env bash

set -e

IMAGE_LOCATION=./radar.img

ENDPOINT_URL=http://radarapi.exactlylabs.com

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Must be run as root"
    exit
fi

if [[ "$#" -ne 1 ]]; then
    echo "Must pass device to flash as only parameter e.g. /dev/sdc"
fi

apt-get install -y qemu qemu-user-static binfmt-support systemd-container zip jq

dd if=$IMAGE_LOCATION of=$1 bs=1M status=progress

mkdir -p tmp
mount ${1}2 tmp
mount ${1}1 tmp/boot

CLIENT_AUTH=$(curl -XPOST $ENDPOINT_URL/register)

CLIENT_ID=$(echo $CLIENT_AUTH | jq -r .clientId)
CLIENT_SECRET=$(echo $CLIENT_AUTH | jq -r .clientSecret)

echo -e "export CLIENT_ID=${CLIENT_ID}\nexport CLIENT_SECRET=${CLIENT_SECRET}" > tmp/home/radar/client.conf
# user radar group radar
chown 1000:1000 tmp/home/radar/client.conf

umount tmp/boot
umount tmp

echo ""
echo "Client ID:     ${CLIENT_ID}"
echo "Client Secret: ${CLIENT_SECRET}"
