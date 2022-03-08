#!/usr/bin/env bash

set -e

if [[ $(/usr/bin/id -u) -ne 0 ]]; then
    echo "Must be run as root"
    exit
fi

CRONTAB_FILE=./clientcrontab
RUNTESTS_SCRIPT=./runtests.sh
PING_SCRIPT=./ping.sh
REMOTETUNNEL_SERVICE=./remotetunnel.service
PING_SERVICE=./radarping.service
TUNNEL_SCRIPT=./tunnel.sh

NDT_URL=https://storage.googleapis.com/exactly-public/ndt7

OUTPUT_FILE=radar.img

apt-get install -y qemu qemu-user-static binfmt-support systemd-container zip

wget https://raspi.debian.net/tested/20210823_raspi_4_bullseye.img.xz
unxz 20210823_raspi_4_bullseye.img.xz

LOOP_DEV=$(losetup -f -P --show 20210823_raspi_4_bullseye.img)

mkdir -p tmp
mount ${LOOP_DEV}p2 -o rw tmp
mount ${LOOP_DEV}p1 -o rw tmp/boot

# Setup radar user
echo "radar:x:1000:1000:,,,:/home/radar:/bin/bash" >> tmp/etc/passwd
echo "radar:x:1000:" >> tmp/etc/group
echo "radar:*:18862:0:99999:7:::" >> tmp/etc/shadow
cp -r tmp/etc/skel/. tmp/home/radar
mkdir -p tmp/home/radar/.ssh

# Disable root local password login
tail -n +2 tmp/etc/shadow > tmp/etc/shadow.tmp
echo 'root:*:18862:0:99999:7:::' | cat - tmp/etc/shadow.tmp > tmp/etc/shadow
rm tmp/etc/shadow.tmp

# Setup NDT
curl -O $NDT_URL
mv ndt7 tmp/home/radar
chmod +x tmp/home/radar/ndt7

# Setup Ookla
curl -O https://install.speedtest.net/app/cli/ookla-speedtest-1.0.0-arm-linux.tgz
tar -zxf ookla-speedtest-1.0.0-arm-linux.tgz speedtest
rm ookla-speedtest-1.0.0-arm-linux.tgz
mv speedtest tmp/home/radar

# Setup SSH Tunneling
cp $REMOTETUNNEL_SERVICE tmp/etc/systemd/system/
cp $PING_SERVICE tmp/etc/systemd/system/

cp $RUNTESTS_SCRIPT tmp/home/radar
cp $PING_SCRIPT tmp/home/radar
cp $TUNNEL_SCRIPT tmp/home/radar
cp $CRONTAB_FILE tmp/var/spool/cron/crontabs/radar
chmod 600 tmp/var/spool/cron/crontabs/radar
# User 'radar' Group 'crontab'
chown 1000:108 tmp/var/spool/cron/crontabs/radar

chown -R 1000:1000 tmp/home/radar

# Create Chroot
cp /usr/bin/qemu-aarch64-static tmp/usr/bin
cp withinnewimage.sh tmp/root

systemd-nspawn -D tmp /root/withinnewimage.sh

# Allow radar to elevate to root
echo "radar ALL=(ALL:ALL) NOPASSWD:ALL" > tmp/etc/sudoers.d/radar_sudoers
chown 0:0 tmp/etc/sudoers.d/radar_sudoers
chmod 440 tmp/etc/sudoers.d/radar_sudoers

rm tmp/usr/bin/qemu-aarch64-static
rm tmp/root/withinnewimage.sh

umount tmp/boot
umount tmp
rm -r tmp

mv 20210823_raspi_4_bullseye.img $OUTPUT_FILE
zip $OUTPUT_FILE.zip $OUTPUT_FILE
