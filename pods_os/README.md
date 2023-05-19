# POD Emulation
## Setup QEMU

The QEMU version used when this project was created was 7.2.1. So make sure you get the same version or a higher one.

You can download the source [here](https://www.qemu.org/download/). Then follow the instructions to build it.


## Adding Network

We add two networks in the emulator. The first is a user type network,
that helps us with accessing through SSH without knowing the IP the emulator will get.
There's nothing to be configured here, so no need to worry about it.

The second network is a bridge type network. When started, it opens a TAP and connects it to the bridge in your host.
If you don't have a bridge, you can see how to setup one [here](https://wiki.qemu.org/Documentation/Networking#Setting_up_taps_on_Linux)


## Setup POD the Image

Download the [POD OS Image](https://console.cloud.google.com/storage/browser/radar-disk-images).
Select which version you want emulate.

Once the download finishes, run:

```sh
sudo ./scripts/dev_img.sh <path_to_downloaded_zipfile> <path_to_an_ssh_pub_key>
```

The script support some options to customize the image, run `./scripts/dev_img.sh -h` to understand more.


## Run the Emulator

If everything is correctly configured, just run:

```sh
sudo ./scripts/emulate.sh
```

You should see a window pop up and a raspberry pi turning on.
