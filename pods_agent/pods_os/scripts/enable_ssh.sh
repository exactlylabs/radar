#!/usr/bin/env bash

# Enables SSH in an image and add an ssh key be able to login into it
set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Must be run as root"
    exit 1
fi

function usage {
  echo "Usage: ./enable_ssh image_path public_key"
  echo ""
  echo "Enables ssh in the Pi OS image and add the public key to it"
}

if [ -z $1 ] || [ -z $2 ]; then
  echo "Error: missing arguments"
  usage
  exit 1
fi

IMAGE_LOCATION=${1}
KEY_LOCATION=${2}

if [[ ! -f "$IMAGE_LOCATION" ]]; then
    echo "Error: Image not found at '$IMAGE_LOCATION' as expected"
    usage
    exit 1
fi

TMP_DIR=${SCRIPT_DIR}/tmp
mkdir -p $TMP_DIR

LOOP_DEV=$(losetup -f -P --show ${IMAGE_LOCATION})

mount ${LOOP_DEV}p2 -o rw ${TMP_DIR}
mount ${LOOP_DEV}p1 -o rw ${TMP_DIR}/boot

touch ${TMP_DIR}/boot/ssh

cp $KEY_LOCATION $TMP_DIR/home/radar/.ssh/authorized_keys

# Set owner and group to radar
chown 1000:1000 $TMP_DIR/home/radar/.ssh/authorized_keys
chmod 644 $TMP_DIR/home/radar/.ssh/authorized_keys

umount ${TMP_DIR}/boot
umount ${TMP_DIR}
losetup -d ${LOOP_DEV}

rm -r ${TMP_DIR}
