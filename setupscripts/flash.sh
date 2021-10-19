#!/usr/bin/env bash

set -e

IMAGE_LOCATION=./radar.img

if [[ ! -f "$IMAGE_LOCATION" ]]; then
    echo "Image not found at '$IMAGE_LOCATION' as expected"
    exit 1
fi

API_ENDPOINT_URL=https://radar.exactlylabs.com

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Must be run as root"
    exit 1
fi

if [[ "$#" -ne 2 ]]; then
    echo "usage: ./flash.sh <AUTHORIZED_KEYS_FILE> <DEVICE>"
    echo "  Where <AUTHORIZED_KEYS_FILE> is a SSH authorized_keys key file to place on this device"
    echo "  and <DEVICE> is the block device to write the image to e.g. /dev/sdc"
    exit 1
fi

apt-get install -y qemu qemu-user-static binfmt-support systemd-container zip jq

dd if=$IMAGE_LOCATION of=$2 bs=1M status=progress

mkdir -p tmp
mount ${2}2 tmp
mount ${2}1 tmp/boot

cp $1 tmp/home/radar/.ssh/authorized_keys
# Set owner and group to radar
chown 1000:1000 tmp/home/radar/.ssh/authorized_keys
chmod 644 tmp/home/radar/.ssh/authorized_keys

CLIENT_AUTH=$(curl -H "Accept: application/json" -XPOST $API_ENDPOINT_URL/clients)

CLIENT_ID=$(echo $CLIENT_AUTH | jq -r .unix_user)
CLIENT_SECRET=$(echo $CLIENT_AUTH | jq -r .secret)

echo -e "export CLIENT_ID=${CLIENT_ID}\nexport CLIENT_SECRET=${CLIENT_SECRET}" > tmp/home/radar/client.conf
# user radar group radar
chown 1000:1000 tmp/home/radar/client.conf

echo ""
echo "Client ID:     ${CLIENT_ID}"
echo "Client Secret: ${CLIENT_SECRET}"

umount tmp/boot
umount tmp
