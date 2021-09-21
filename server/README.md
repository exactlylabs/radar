### Setup

To create a new image, on a debian 11 amd64 system: copy the contents of the assets folder, copy a public SSH key to the same directory and name it `authorized_keys` and then run as root:

    ./createimage.sh

The public SSH key will be used to allow remote access to any devices using this image. Once the image has been completed, to image an SD card with the newly created image and to configure the image run:

    ./flash.sh <DEVICE>

With `<DEVICE>` replaced by the SD's device such as `/dev/sdc`.
