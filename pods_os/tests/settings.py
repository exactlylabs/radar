import os

RADAR_IMAGE = os.getenv("RADAR_IMAGE", "dist/radar.img")
DTB_FILE = os.getenv("DTB_FILE", "kernels/bcm2710-rpi-3-b.dtb")
KERNEL_FILE = os.getenv("KERNEL_FILE", "kernels/kernel8.img")

