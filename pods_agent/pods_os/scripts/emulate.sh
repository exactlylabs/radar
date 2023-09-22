#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
set -e

DTB_FILE_PATH=${SCRIPT_DIR}/../kernels/bcm2710-rpi-3-b.dtb
KERNEL_FILE_PATH=${SCRIPT_DIR}/../kernels/kernel8.img
IMAGE_FILE=${SCRIPT_DIR}/../dist/radar.img

function usage() {
  echo """
Usage: $0 [OPTIONS]

  Run the given image in QEMU

  Options:

  -h | --help          Show this help message
  -d | --dtb           Set the path to the .dtb file to use
  -k | --kernel        Set the path to the kernel file to use
  -i | --image         Set the path to the POD OS .img file to use
"""
}

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Error: Must be run as root"
    usage
    exit 1
fi


while :; do
    case $1 in
        -h|--help)
            help
            exit 0
        ;;
        -d|--dtb)
            required $1 $2
            DTB_FILE_PATH=$2
            shift
        ;;
        -k|--kernel)
            required $1 $2
            KERNEL_FILE_PATH=$2
            shift
        ;;
        -i|--image)
            required $1 $2
            IMAGE_FILE=$2
            shift
        ;;
        *) break
    esac
    shift
done


if [ ! -f $IMAGE_FILE ];then
  echo "ERROR: Image file at $IMAGE_FILE, does not exist"
  usage
  exit 1
fi

# Open the image file, to grab the .dtb and kernel.img

qemu-system-aarch64 \
  -machine raspi3b \
  -cpu cortex-a72 \
  -dtb $DTB_FILE_PATH \
  -m 1G \
  -smp 4 \
  -kernel $KERNEL_FILE_PATH \
  -sd $IMAGE_FILE \
  -serial stdio \
  -netdev user,id=net1,hostfwd=tcp::2222-:22 \
  -device usb-net,netdev=net1 \
  -append "rw earlyprintk loglevel=8 console=ttyAMA0,115200 console=tty1 dwc_otg.lpm_enable=0 root=/dev/mmcblk0p2 rootdelay=1"
  # -netdev bridge,id=net0 \
  # -device usb-net,netdev=net0,mac=cc:9a:1d:1f:cf:0b \

