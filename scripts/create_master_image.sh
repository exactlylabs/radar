#!/usr/bin/env bash

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Must be run as root"
    exit
fi

function usage() {
echo """
Usage: ./create_master_image.sh [OPTIONS] <SUPERACCOUNT_TOKEN>

Required Arguments:

  SUPERACCOUNT_TOKEN: is a token provided to you from radar server administrators

Optional Arguments:

  -s or --enable-ssh : Enables SSH server. [default: Not Enabled]
"""
}

ENABLE_SSH=0
RADAR_SERVER_URL="https://radar.exactlylabs.com"

while :; do
    case $1 in
        -h|--help)
            usage
            exit 0
        ;;
        -s|--enable-ssh)             
            ENABLE_SSH=1
        ;;
        -u|--url)
            RADAR_SERVER_URL=$2
            shift
        ;;
        *) break
    esac
    shift
done


if [ -z "$1" ]; then
    echo "Error: missing SUPERACCOUNT_TOKEN argument"
    usage
    exit 1
fi


AGENT_SERVICE="radar_agent.service"
WATCHDOG_SERVICE="podwatchdog@.service"
RADAR_AGENT_BIN_URL="$RADAR_SERVER_URL/client_versions/stable/distributions/linux-arm64/download"
RADAR_WATCHDOG_BIN_URL="$RADAR_SERVER_URL/watchdog_versions/stable/download"
PROJECT_DIR="opt/radar"
BINARY_NAME="radar_agent"
WATCHDOG_BINARY_NAME="watchdog"
IMAGE_FILENAME="radar.img"
SUPERACCOUNT_TOKEN="$1"
FILES_DIR=${SCRIPT_DIR}/pod_image_files
BUILD_DIR=${SCRIPT_DIR}/build
TMP_DIR=${BUILD_DIR}/tmp

mkdir -p ${BUILD_DIR}
mkdir -p ${TMP_DIR}

## Start ##

apt-get install -y qemu qemu-user-static binfmt-support systemd-container zip unzip

curl --output ${BUILD_DIR}/$BINARY_NAME $RADAR_AGENT_BIN_URL
curl --output ${BUILD_DIR}/$WATCHDOG_BINARY_NAME $RADAR_WATCHDOG_BIN_URL

#### NOTE: Images after 2022-01-28 appear to use .xz and before use .zip
# Decompress the .xz file
#VERSION=2022-04-04-raspios-bullseye-arm64-lite.img
# if [ ! -f $VERSION.xz ]; then
# curl -L --output $VERSION.xz https://downloads.raspberrypi.org/raspios_lite_arm64/images/raspios_lite_arm64-2022-04-07/$VERSION.xz 
# fi
# unxz $VERSION.xz

VERSION=2022-01-28-raspios-bullseye-arm64-lite.img
if [ ! -f ${BUILD_DIR}/${VERSION}.zip ]; then
curl -L --output ${BUILD_DIR}/${VERSION}.zip https://downloads.raspberrypi.org/raspios_lite_arm64/images/raspios_lite_arm64-2022-01-28/2022-01-28-raspios-bullseye-arm64-lite.zip
fi
unzip -qod ${BUILD_DIR} ${BUILD_DIR}/${VERSION}.zip

# Mount the .img in an available loop (/dev/loop) device
# This makes plain files accessible as block devices 
# (as if it was a device such as a HD)
LOOP_DEV=$(losetup -f -P --show ${BUILD_DIR}/${VERSION})

mount ${LOOP_DEV}p2 -o rw ${TMP_DIR}
mount ${LOOP_DEV}p1 -o rw ${TMP_DIR}/boot


# Configure the Image

# Setup radar user
echo "radar:x:1000:1000:,,,:/home/radar:/bin/bash" >> ${TMP_DIR}/etc/passwd
echo "radar:x:1000:" >> ${TMP_DIR}/etc/group
echo "radar:*:18862:0:99999:7:::" >> ${TMP_DIR}/etc/shadow
cp -r ${TMP_DIR}/etc/skel/. ${TMP_DIR}/home/radar
mkdir -p ${TMP_DIR}/home/radar/.ssh

# Disable root local password login
tail -n +2 ${TMP_DIR}/etc/shadow > ${TMP_DIR}/etc/shadow.tmp
echo 'root:*:18862:0:99999:7:::' | cat - ${TMP_DIR}/etc/shadow.tmp > ${TMP_DIR}/etc/shadow
rm ${TMP_DIR}/etc/shadow.tmp


# Setup Radar Agent into the image

# Replace the variables in the .service and move to the 
# mount's systemd dir
AGENT_BINARY_PATH="/$PROJECT_DIR/$BINARY_NAME" \
envsubst < ${FILES_DIR}/$AGENT_SERVICE > ${TMP_DIR}/etc/systemd/system/$AGENT_SERVICE

# Copy Radar Agent Binary to the image
mkdir -p ${TMP_DIR}/$PROJECT_DIR
cp ${BUILD_DIR}/$BINARY_NAME ${TMP_DIR}/$PROJECT_DIR/$BINARY_NAME
chmod +x ${TMP_DIR}/$PROJECT_DIR/$BINARY_NAME

# Move Pod Watchdog .service and the binary to the image
WATCHDOG_BINARY_PATH="/$PROJECT_DIR/$WATCHDOG_BINARY_NAME"
cp ${SCRIPT_DIR}/../agent/watchdog/osfiles/etc/systemd/system/podwatchdog@.service ${TMP_DIR}/etc/systemd/system/$WATCHDOG_SERVICE
sed -i -r 's|^(ExecStart=).*|\1'"${WATCHDOG_BINARY_PATH}"'|' ${TMP_DIR}/etc/systemd/system/$WATCHDOG_SERVICE
cp ${BUILD_DIR}/$WATCHDOG_BINARY_NAME ${TMP_DIR}/$PROJECT_DIR/$WATCHDOG_BINARY_NAME
chmod +x ${TMP_DIR}/$PROJECT_DIR/$WATCHDOG_BINARY_NAME
chown :1000 ${TMP_DIR}/etc/systemd/system/$WATCHDOG_SERVICE

# Set permissions for radar user and create .config/radar directory
chown -R 1000:1000 ${TMP_DIR}/home/radar
chown -R 1000:1000 ${TMP_DIR}/$PROJECT_DIR
mkdir -p ${TMP_DIR}/home/radar/.config/radar

# Move radar config.conf file with the superaccount token set
REGISTRATION_TOKEN=$SUPERACCOUNT_TOKEN \
envsubst < ${FILES_DIR}/config.conf > ${TMP_DIR}/home/radar/.config/radar/config.conf
chown -R 1000:1000 ${TMP_DIR}/home/radar/

# Create Chroot
cp /usr/bin/qemu-aarch64-static ${TMP_DIR}/usr/bin
cp ${FILES_DIR}/withinnewimage.sh ${TMP_DIR}/root
systemd-nspawn -D ${TMP_DIR} /root/withinnewimage.sh

# Allow radar to elevate to root
echo "radar ALL=(ALL:ALL) NOPASSWD:ALL" > ${TMP_DIR}/etc/sudoers.d/radar_sudoers
chown 0:0 ${TMP_DIR}/etc/sudoers.d/radar_sudoers
chmod 440 ${TMP_DIR}/etc/sudoers.d/radar_sudoers

if [[ $ENABLE_SSH -eq 1 ]]; then
    touch ${TMP_DIR}/boot/ssh
fi

# copy firstrun.sh to boot and configure cmdline.txt to run it
echo "$(echo -n $(cat ${TMP_DIR}/boot/cmdline.txt)) systemd.run=/boot/firstrun.sh systemd.run_success_action=reboot systemd.unit=kernel-command-line.target" > ${TMP_DIR}/boot/cmdline.txt
cp ${FILES_DIR}/firstrun.sh ${TMP_DIR}/boot/firstrun.sh

# Clear and umount
rm ${TMP_DIR}/usr/bin/qemu-aarch64-static
rm ${TMP_DIR}/root/withinnewimage.sh

umount ${TMP_DIR}/boot
umount ${TMP_DIR}
losetup -d $LOOP_DEV

mkdir -p ${SCRIPT_DIR}/dist
mv ${BUILD_DIR}/$VERSION ${SCRIPT_DIR}/dist/$IMAGE_FILENAME
zip ${SCRIPT_DIR}/dist/$IMAGE_FILENAME.zip ${SCRIPT_DIR}/dist/$IMAGE_FILENAME

rm -r ${BUILD_DIR}