#!/usr/bin/env bash

sudo apt-get update
sudo apt-get upgrade
sudo apt-get install -y postgresql
sudo -u postgres createdb radar
sudo -u postgres createuser -s root
