#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
$ROOT_DIR=$SCRIPT_DIR/../

set -e

curl -o qemu_python.tar.gz https://gitlab.com/qemu-project/qemu/-/archive/stable-7.2/qemu-stable-7.2.tar.gz?path=python
tar -xvf qemu_python.tar.gz
pip3 install -r $ROOT_DIR/requirements.txt
avocado vt-bootstrap --yes-to-all

ssh-keygen -q -t rsa -N '' -f $ROOT_DIR/tests/keys/id_rsa <<<y > /dev/null 2>&1
