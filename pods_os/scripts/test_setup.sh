#!/usr/bin/env bash

curl -o qemu_python.tar.gz https://gitlab.com/qemu-project/qemu/-/archive/stable-7.2/qemu-stable-7.2.tar.gz?path=python
tar -xvf qemu_python.tar.gz
pip3 install -r ./requirements.txt
avocado vt-bootstrap --yes-to-all
