#!/usr/bin/env bash

set -e

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Must be run as root"
    exit
fi

AGENT_SERVICE="radar_agent.service"
RADAR_AGENT_BIN_URL="https://radar.exactlylabs.com/client-versions/stable/distributions/linux-arm64/download"
PROJECT_DIR="opt/radar"
BINARY_NAME="radar_agent"
IMAGE_FILENAME="radar.img"
SUPERUSER_TOKEN="DQCMwRbMddaxLFQ2mJU6rgaL"

## Start ##

apt-get install -y qemu qemu-user-static binfmt-support systemd-container zip

# TODO: UNCOMMENT THIS WHEN THE SERVER HAS THE ENDPOINT IMPLEMENTED
curl --output $BINARY_NAME $RADAR_AGENT_BIN_URL

cp ../agent/dist/radar_agent .

# Decompress the .xz file
VERSION=20220121_raspi_4_bullseye.img
curl --output $VERSION.xz https://raspi.debian.net/tested/$VERSION.xz 
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

rm tmp/usr/bin/qemu-aarch64-static
rm tmp/root/withinnewimage.sh

umount tmp/boot
umount tmp
losetup -d $LOOP_DEV
rm -r tmp

mv $VERSION $IMAGE_FILENAME
zip $IMAGE_FILENAME.zip $IMAGE_FILENAME
