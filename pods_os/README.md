
Download a [Raspberry PI image](https://www.raspberrypi.com/software/operating-systems/) to extract the kernel and hardware description used by RPI OS from


Decompress it using `xz --decompress <image_file>.img.xz` and run `fdisk -l <image_file>.img`

The decompressed image has two partitions, the first being the boot partition, that starts at sector 8192 of the disk file.

We can mount it by executing:

`sudo mount -o loop,offset=4194304 ./<image_file> /mnt/test`

`offset=4194304` comes from the number of bytes from each sector (512 bytes) times the sector starting position `8192` -> `8192 * 512 = 4194304`



Install qemu -> `sudo apt install qemu`

Now we can test it by executing:

```sh
qemu-system-aarch64 \
  -machine raspi3b \
  -cpu cortex-a72 \
  -dtb /mnt/test/bcm2710-rpi-3-b-plus.dtb \
  -m 1G \
  -smp 4 \
  -serial stdio \
  -kernel /mnt/test/kernel8.img \
  -append "rw earlyprintk loglevel=8 console=ttyAMA0,115200 dwc_otg.lpm_enable=0 root=/dev/mmcblk0p2 rootdelay=1"
```

This spawns an aarch64 ARM machine, having the raspberry PI 3B hardware specifications, with a Cortex A72 CPU, using the hardware description from the downloaded image, with 1 GB of RAM, 4 coers, connected to the stdio. The boot will use kernel8.img kernel file and a few boot options are going to be appended, such as configure the console and root drive, which is an eMMC device located at /dev/mmcblk0p2.

Once this is run, it will end up failing, because we are missing a bootable device. This means that there's no disk image to boot. This works as if there's no SD card in our raspberry PI.


So we can increment that command to point to the image we want to use:

```sh
qemu-system-aarch64 \
  -machine raspi3b \
  -cpu cortex-a72 \
  -dtb /mnt/test/bcm2710-rpi-3-b.dtb \
  -m 1G \
  -smp 4 \
  -kernel /mnt/test/kernel8.img \
  -sd ./radar.img \
  -serial stdio \
  -append "rw earlyprintk loglevel=8 console=ttyAMA0,115200 console=tty1 dwc_otg.lpm_enable=0 root=/dev/mmcblk0p2 rootdelay=1"
```

Now, it fails stating that the SD card size is invalid, because it must be a power of 2! So we must resize the image

**create a backup file** just in case.

then run: `qemu-img resize <img_file>.img <size>` -- In my case, the image had 1.9G, so I resized it to 2G


## Adding Network 

Source: https://beroal.livejournal.com/81163.html

* I installed `libvirt-dev` and `libvirt-daemon`
* Enable it by calling `systemctl enable libvirtd.service` and `systemctl start libvirtd.service`
* Then start the default network bridge: `sudo virsh net-autostart --network default` and `sudo virsh net-start --network default`
  
** I had to add a file having `allow virtbr0` and save it as `/etc/qemu/bridge.conf`
** Later, I saw that my qemu was installed in the `/usr/local` directory, so I had to copy that bridge.conf file to `/usr/local/etc/qemu/bridge.conf`


```sh
qemu-system-aarch64 \
  -machine raspi3b \
  -cpu cortex-a72 \
  -dtb /mnt/test/bcm2710-rpi-3-b.dtb \
  -m 1G \
  -smp 4 \
  -kernel /mnt/test/kernel8.img \
  -sd ./radar.img \
  -serial stdio \
  -device usb-net,netdev=net0 \
  -netdev user,id=net0,hostfwd=tcp::5555-:22 \
  -append "rw earlyprintk loglevel=8 console=ttyAMA0,115200 console=tty1 dwc_otg.lpm_enable=0 root=/dev/mmcblk0p2 rootdelay=1"
```