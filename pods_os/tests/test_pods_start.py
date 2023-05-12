import math
import os
import shutil
import subprocess
import tempfile
import time
from functools import reduce

import avocado
from avocado.utils import ssh, vmimage

from qemu.machine import QEMUMachine
from qemu.utils import get_info_usernet_hostfwd_port

from tests import settings

BASE_DIR = os.path.dirname(os.path.dirname(__file__))


def is_power_of_2(x):
    return math.log2(x) % 1.0 == 0.0


def run_cmd(args):
    p = subprocess.Popen(
        args,
        stdout=subprocess.PIPE,
        stdin=subprocess.PIPE,
        universal_newlines=True,
    )
    stdout, stderr = p.communicate()
    res = p.returncode
    return (stdout, stderr, res)


class TestPods(avocado.Test):
    arch = "aarch64"
    cpu = "cortex-A72"
    machine = "raspi3b"
    kernel_params = (
        "rw earlyprintk loglevel=8 console=ttyAMA0,115200 "
        "console=tty1 dwc_otg.lpm_enable=0 root=/dev/mmcblk0p2 "
        "rootdelay=1"
    )
    ssh_user = "radar"

    def setUp(self) -> None:
        self._vm = None
        self.binary = f"/usr/local/bin/qemu-system-{self.arch}"
        self.qemu_img_binary = f"/usr/local/bin/qemu-img"
        self.dtb = settings.DTB_FILE
        self.kernel = settings.KERNEL_FILE
        self.setup_image()
        self.ssh_pub_key, self.ssh_key = self.setup_ssh_keys()

    def setup_image(self):
        self.image = settings.RADAR_IMAGE
        image_size = os.path.getsize(self.image)
        gb_size = image_size // 1e9
        if is_power_of_2(gb_size):
            # We need to resize this to a power of 2
            i = 1
            while not is_power_of_2(gb_size + i):
                i += 1
            new_size = gb_size + i
            _, _, ret = run_cmd([
                self.qemu_img_binary, "resize", self.image, f"{new_size}G"
            ])
            if ret != 0:
                self.fail(
                    f"failed to resize the image {self.image} to {new_size}G"
                )


    def setup_ssh_keys(self):
        # Load the private and public keys, then send the private key to the
        # workdir and return the set
        ssh_key = os.path.join(BASE_DIR, "tests", "keys", "id_rsa")
        ssh_pub_key = ssh_key + ".pub"
        ssh_dir = os.path.join(self.workdir, '.ssh')
        os.makedirs(ssh_dir, mode=0o700, exist_ok=True)
        target_private_key = os.path.join(ssh_dir, os.path.basename(ssh_key))
        shutil.copyfile(
            ssh_key, target_private_key
        )
        os.chmod(target_private_key, 0o600)
        return (ssh_pub_key, target_private_key)

    def _get_vm(self):
        self.socket_dir = tempfile.mkdtemp(prefix="pods_os")
        vm = QEMUMachine(
            self.binary,
            base_temp_dir=self.workdir,
            sock_dir=self.socket_dir,
            log_dir=self.logdir
        )
        self.log.debug("New VM Spawned!")
        self.log.debug("Temp. Dir: %s\nLog Dir: %s", vm.temp_dir, vm.log_dir)
        return vm

    def prepare_vm(self, **options):
        vm = self._get_vm()
        for k, v in options.items():
            vm.add_args(f"-{k}", v)
        return vm

    @property
    def vm(self):
        if not self._vm:
            self._vm = self.prepare_vm()
        return self._vm

    def ssh(self, pubkey, user):
        res = self.vm.command(
            'human-monitor-command',
            command_line='info usernet'
        )
        port = get_info_usernet_hostfwd_port(res)
        self.assertIsNotNone(port)
        self.ssh_session = ssh.Session(
            '127.0.0.1', port=port, user=user, key=pubkey
        )
        for i in range(5):
            try:
                self.ssh_session.connect()
                return
            except:
                self.log.debug(
                    "Failed to connect through ssh -- Attempt %d of %d", 1, 5
                )
                time.sleep(i)
        self.fail(
            "Unable to connect through ssh to host at port %d and user %s",
            port, user
        )

    def test_pod_started(self):
        vm = self.prepare_vm(
            machine="raspi3b",
            cpu="cortex-a72",
            dtb=settings.DTB_FILE,
            m="1G",
            smp="4",
            kernel=settings.KERNEL_FILE,
            sd=settings.RADAR_IMAGE,
            serial="stdio",
            append=self.kernel_params
        )

        with vm as vm:
            vm.set_console()
            vm.launch()

