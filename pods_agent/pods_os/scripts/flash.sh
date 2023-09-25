#!/usr/bin/env bash

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

IMAGE_LOCATION=${SCRIPT_DIR}/../dist/radar.img

if [[ ! -f "$IMAGE_LOCATION" ]]; then
    echo "Image not found at '$IMAGE_LOCATION' as expected"
    exit 1
fi


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

dd if=$IMAGE_LOCATION of=$2 bs=1M status=progress

# Mount the device with the copied data so we can move the ssh pub key
# TODO: Maybe consider having this key already in the master image?

mkdir -p tmp
mount ${2}2 tmp
mount ${2}1 tmp/boot

# Add Pubkey to the image
cp $1 tmp/home/radar/.ssh/authorized_keys

# Set owner and group to radar
chown 1000:1000 tmp/home/radar/.ssh/authorized_keys
chmod 644 tmp/home/radar/.ssh/authorized_keys

umount tmp/boot
umount tmp
rm -r tmp
