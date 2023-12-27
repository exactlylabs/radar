#!/usr/bin/env bash
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
set -e

function usage {
  echo """
Usage: $0 [OPTIONS] <img_zipfile_path> <ssh_pub_key_path>

  This script configures a clean Pod OS image to be used in a QEMU emulator.

  Options:

  -h | --help          Show this help message
  -s | --server-url    Set the server url the pod will connect to
  -c | --config-path   Set the path to the config file to use
  -u | --user          Set this if you want to add a linux user in the image (helps getting in through QEMU terminal)
  -p | --password      Set the password for the linux user
  -w | --watchdog      Set the path to the watchdog binary
  -a | --agent         Set the path to the radar agent binary
  -b | --ssh           Set to allow SSH access to the pod
  """
}

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Error: Must be run as root"
    usage
    exit 1
fi

function required() {
    if [ -z $2 ]; then
        echo "ERROR: $1 requires a non-empty option argument"
        exit 1
    fi
}

while :; do
    case $1 in
        -h|--help)
            help
            exit 0
        ;;
        -s|--server-url)
            required $1 $2
            SERVER_URL=$2
            shift
        ;;
        -c|--config-path)
            required $1 $2
            CONFIG_PATH=$2
            shift
        ;;
        -u|--user)
            required $1 $2
            USER=$2
            shift
        ;;
        -p|--password)
            required $1 $2
            PASSWORD=$2
            shift
        ;;
        -w|--watchdog)
            required $1 $2
            WATCHDOG_PATH=$2
            shift
        ;;
        -a|--agent)
            required $1 $2
            AGENT_PATH=$2
            shift
        ;;
        -b|--ssh)
            SSH=true
        ;;
        *) break
    esac
    shift
done


if [[ -z $1 || -z $2 ]] ; then
  echo "Error: Missing Arguments"
  usage
  exit 1
fi

ZIP_IMAGE_LOCATION=${1}
KEY_LOCATION=${2}

if [[ ! -f "$ZIP_IMAGE_LOCATION" ]]; then
    echo "Error: Zip Image not found at '$ZIP_IMAGE_LOCATION' as expected"
    usage
    exit 1
fi

DIST=$SCRIPT_DIR/../dist

# Unzip the clean POD OS image

rm -rf $DIST
mkdir $DIST
unzip -o $ZIP_IMAGE_LOCATION -d $DIST

# Resize the image to 4G (This might need to be increased in the future)

IMAGE_LOCATION=$DIST/radar.img
qemu-img resize $IMAGE_LOCATION 4G

# Mount the image to start copying files

TMP_DIR=${SCRIPT_DIR}/tmp
mkdir -p $TMP_DIR

LOOP_DEV=$(losetup -f -P --show ${IMAGE_LOCATION})

mount ${LOOP_DEV}p2 -o rw ${TMP_DIR}
mount ${LOOP_DEV}p1 -o rw ${TMP_DIR}/boot

sleep 1

# Enable SSH
if [ ! -z $SSH ]; then
  touch ${TMP_DIR}/boot/ssh

  cp $KEY_LOCATION $TMP_DIR/home/radar/.ssh/authorized_keys

  # Set owner and group to radar
  chown 1000:1000 $TMP_DIR/home/radar/.ssh/authorized_keys
  chmod 644 $TMP_DIR/home/radar/.ssh/authorized_keys
fi

# Retrieve DTB and Kernel Files for use

mkdir -p $SCRIPT_DIR/../kernels
cp ${TMP_DIR}/boot/*.dtb $SCRIPT_DIR/../kernels
cp ${TMP_DIR}/boot/*.img $SCRIPT_DIR/../kernels

# Copy the config file or set the server url to the image

if [ ! -z $CONFIG_PATH ]; then
  cp $CONFIG_PATH $TMP_DIR/home/radar/.config/radar/config.conf
  chown 1000:1000 $TMP_DIR/home/radar/.config/radar/config.conf

elif [ ! -z $SERVER_URL ]; then
  echo server_url=$SERVER_URL >> $TMP_DIR/home/radar/.config/radar/config.conf
fi

# Add a user

if [ ! -z $USER ]; then
  echo "$USER:x:1001:1001:$USER,,,:/home/$USER:/usr/bin/bash" >> $TMP_DIR/etc/passwd
  echo "$USER ALL=(ALL) NOPASSWD: ALL" > $TMP_DIR/etc/sudoers.d/010_${USER}-nopasswd
  PWD=$(openssl passwd -5 -salt radar $PASSWORD)
  echo "$USER:$PWD:19036:0:99999:7:::" >> $TMP_DIR/etc/shadow

fi

# Replace the existing Watchdog

if [ ! -z $WATCHDOG_PATH ]; then
  cp $WATCHDOG_PATH $TMP_DIR/opt/radar/watchdog
  chown 1000:1000 $TMP_DIR/opt/radar/watchdog
  chmod +x $TMP_DIR/opt/radar/watchdog
fi

# Replace the existing Agent

if [ ! -z $AGENT_PATH ]; then
  cp $AGENT_PATH $TMP_DIR/opt/radar/radar_agent
  chown 1000:1000 $TMP_DIR/opt/radar/radar_agent
  chmod +x $TMP_DIR/opt/radar/radar_agent
fi

sleep 1

umount ${TMP_DIR}/boot
umount ${TMP_DIR}
losetup -d ${LOOP_DEV}

rm -r ${TMP_DIR}

echo "Done configuring the image for development"
