#!/usr/bin/env bash

set -e

sudo rm -f /var/spool/cron/crontabs/radar
echo "$(($RANDOM % 60)) */1 * * * /home/radar/runtests.sh" | sudo tee /var/spool/cron/crontabs/radar
sudo chmod 600 /var/spool/cron/crontabs/radar
sudo chown 1000:108 /var/spool/cron/crontabs/radar

