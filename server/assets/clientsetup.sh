#!/usr/bin/env bash

set -e

AUTHORIZED_KEYS_PATH=./authorized_keys

CRONTAB_FILE=./clientcrontab
RUNTESTS_SCRIPT=./runtests.sh
REMOTETUNNEL_SERVICE=./remotetunnel.service
FIRSTBOOT_SCRIPT=./firstboot.sh

NDT_URL=https://storage.googleapis.com/exactly-public/ndt7

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Must be run as root"
    exit
fi

curl https://raspi.debian.net/verified/20210823_raspi_4_bullseye.img.xz -O
xz -d -v 20210823_raspi_4_bullseye.img.xz

# This was discovered via `fdisk -l 20210823_raspi_4_bullseye.img` and
# looking at the "start" sector of the device "20210823_raspi_4_bullseye.img2"
# and multiplying by sector size of 512

mkdir -p tmp
mount -o loop,offset=314572800 20210823_raspi_4_bullseye.img tmp

# Setup SSH on first boot
touch tmp/boot/ssh

# Setup 'radar' user
echo "radar:x:1000:1000:,,,:/home/radar:/bin/bash" >> tmp/etc/passwd
echo "radar:x:1000:" >> tmp/etc/group
echo "radar:*:18862:0:99999:7:::" >> tmp/etc/shadow
mkdir -p tmp/home/radar/.ssh
cp -r tmp/etc/skel/. tmp/home/radar

# Setup NDT
curl -O $NDT_URL
mv ndt7 tmp/home/radar
chmod +x tmp/home/radar/ndt7

# Setup Ookla
curl -O https://install.speedtest.net/app/cli/ookla-speedtest-1.0.0-arm-linux.tgz
tar -zxf ookla-speedtest-1.0.0-arm-linux.tgz speedtest
mv speedtest tmp/home/radar

# Setup SSH Tunneling
cp $REMOTETUNNEL_SERVICE tmp/etc/systemd/system/

cp $RUNTESTS_SCRIPT tmp/home/radar
cp $AUTHORIZED_KEYS_PATH tmp/home/radar/.ssh/authorized_keys
cp $CRONTAB_FILE tmp/var/spool/cron/crontabs/radar
chmod 600 tmp/var/spool/cron/crontabs/radar
# User 'radar' Group 'crontab'
chown 1000:108 tmp/var/spool/cron/crontabs/radar

chown -R 1000:1000 tmp/home/radar
chmod 644 tmp/home/radar/.ssh/authorized_keys

cp $FIRSTBOOT_SCRIPT tmp/root
echo "@reboot /root/firstboot.sh" > tmp/var/spool/cron/crontabs/root
chown 0:108 tmp/var/spool/cron/crontabs/root
chmod 600 tmp/var/spool/cron/crontabs/root

umount tmp
mv 20210823_raspi_4_bullseye.img $(date --rfc-3339=date)_radar.img
