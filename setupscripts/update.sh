#!/usr/bin/env bash

set -e

sudo mv radarping.service /etc/systemd/system/
sudo systemctl enable radarping
sudo systemctl start radarping

