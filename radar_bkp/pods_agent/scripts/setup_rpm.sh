#!/usr/bin/env bash

# This script is intended to be used on the CI, using a fedora image
# Unless you are trying to create one using a docker image, you shouldn't be using it.


sudo dnf install -y rpmdevtools rpmlint git wget make systemd-rpm-macros gettext

# Install Golang 
wget https://go.dev/dl/go1.18.3.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xf go1.18.3.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
echo "export PATH=\$PATH:/usr/local/go/bin" >> ~/.bashrc


