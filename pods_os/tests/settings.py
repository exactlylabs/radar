import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

RADAR_IMAGE = os.path.join(
    BASE_DIR, os.getenv("RADAR_IMAGE", "dist/radar.img"))
DTB_FILE = os.path.join(
    BASE_DIR, os.getenv("DTB_FILE", "kernels/bcm2710-rpi-3-b.dtb")
)
KERNEL_FILE = os.path.join(
    BASE_DIR, os.getenv("KERNEL_FILE", "kernels/kernel8.img")
)

