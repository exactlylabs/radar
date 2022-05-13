#!/usr/bin/env bash

set -e

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Must be run as root"
    exit
fi

function usage() {
echo """
Usage: ./create_master_image.sh [OPTIONS] <SUPERUSER_TOKEN>

Required Arguments:

  SUPERUSER_TOKEN: is a token provided to you from radar server administrators

Optional Arguments:

  -s or --enable-ssh : Enables SSH server. [default: Not Enabled]
"""
}

ENABLE_SSH=0

while :; do
    case $1 in
        -h|--help)
            usage
            exit 0
        ;;
        -s|--enable-ssh)             
            ENABLE_SSH=1
        ;;
        *) break
    esac
    shift
done


if [ -z "$1" ]; then
    echo "Error: missing SUPERUSER_TOKEN argument"
    usage
    exit 1
fi

RADAR_SERVER_URL="https://radar.exactlylabs.com"

AGENT_SERVICE="radar_agent.service"
RADAR_AGENT_BIN_URL="$RADAR_SERVER_URL/client_versions/stable/distributions/linux-arm64/download"
PROJECT_DIR="opt/radar"
BINARY_NAME="radar_agent"
IMAGE_FILENAME="radar.img"
SUPERUSER_TOKEN="$1"

## Start ##

apt-get install -y qemu qemu-user-static binfmt-support systemd-container zip

curl --output $BINARY_NAME $RADAR_AGENT_BIN_URL


# Decompress the .xz file
VERSION=2022-04-04-raspios-bullseye-arm64-lite.img
if [ ! -f $VERSION.xz ]; then
curl -L --output $VERSION.xz https://downloads.raspberrypi.org/raspios_lite_arm64/images/raspios_lite_arm64-2022-04-07/$VERSION.xz 
fi
unxz $VERSION.xz


# Mount the .img in an available loop (/dev/loop) device
# This makes plain files accessible as block devices 
# (as if it was a device such as a HD)
LOOP_DEV=$(losetup -f -P --show $VERSION)

mkdir -p tmp
mount ${LOOP_DEV}p2 -o rw tmp
mount ${LOOP_DEV}p1 -o rw tmp/boot


# Configure the Image

# Setup radar user
echo "radar:x:1000:1000:,,,:/home/radar:/bin/bash" >> tmp/etc/passwd
echo "radar:x:1000:" >> tmp/etc/group
echo "radar:*:18862:0:99999:7:::" >> tmp/etc/shadow
cp -r tmp/etc/skel/. tmp/home/radar
mkdir -p tmp/home/radar/.ssh

# Disable root local password login
tail -n +2 tmp/etc/shadow > tmp/etc/shadow.tmp
echo 'root:*:18862:0:99999:7:::' | cat - tmp/etc/shadow.tmp > tmp/etc/shadow
rm tmp/etc/shadow.tmp


# Setup Radar Agent into the image

# Replace the variables in the .service and move to the 
# mount's systemd dir
AGENT_BINARY_PATH="/$PROJECT_DIR/$BINARY_NAME" \
envsubst < $AGENT_SERVICE > tmp/etc/systemd/system/$AGENT_SERVICE

mkdir -p tmp/$PROJECT_DIR
cp $BINARY_NAME tmp/$PROJECT_DIR/$BINARY_NAME
chmod +x tmp/$PROJECT_DIR/$BINARY_NAME
chown -R 1000:1000 tmp/home/radar
chown -R 1000:1000 tmp/$PROJECT_DIR

mkdir -p tmp/home/radar/.config/radar

# Move radar config.conf file with the superuser token set
REGISTRATION_TOKEN=$SUPERUSER_TOKEN \
envsubst < config.conf > tmp/home/radar/.config/radar/config.conf
chown -R 1000:1000 tmp/home/radar/
# Create Chroot
cp /usr/bin/qemu-aarch64-static tmp/usr/bin
cp withinnewimage.sh tmp/root

systemd-nspawn -D tmp /root/withinnewimage.sh

# Allow radar to elevate to root
echo "radar ALL=(ALL:ALL) NOPASSWD:ALL" > tmp/etc/sudoers.d/radar_sudoers
chown 0:0 tmp/etc/sudoers.d/radar_sudoers
chmod 440 tmp/etc/sudoers.d/radar_sudoers

if [[ $ENABLE_SSH -eq 1 ]]; then
    touch tmp/boot/ssh
fi

rm tmp/usr/bin/qemu-aarch64-static
rm tmp/root/withinnewimage.sh

umount tmp/boot
umount tmp
losetup -d $LOOP_DEV
rm -r tmp

mv $VERSION $IMAGE_FILENAME
zip $IMAGE_FILENAME.zip $IMAGE_FILENAME
