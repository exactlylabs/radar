#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR=$SCRIPT_DIR/../

set -e

apt update && apt install -y curl python3 python3-pip git tcpdump netcat iproute2 arping

curl -o qemu_python.tar.gz https://gitlab.com/qemu-project/qemu/-/archive/stable-7.2/qemu-stable-7.2.tar.gz?path=python
tar -xvf qemu_python.tar.gz
pip3 install -r $ROOT_DIR/requirements.txt
avocado vt-bootstrap --yes-to-all
