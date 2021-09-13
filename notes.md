To make image:

On source machine from server/assets run `scp * DEST_IP:~/`
then `scp ~/.ssh/id_rsa.pub DEST_IP:~/authorized_keys`

On dest machine run: `./clientsetup.sh`

then on source machine, insert SD to be written:
```
scp 10.1.3.102:~/2021-09-12_radar.img .
sudo diskutil unmountDisk /dev/disk2 # ASSUMES SD is disk2
sudo dd bs=1m if=2021-09-12_radar.img of=/dev/rdisk2
sudo diskutil eject /dev/disk2 
```
