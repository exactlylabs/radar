import math
import os
import shutil
import subprocess
import tempfile
import time

import avocado
from avocado.utils import ssh, datadrainer, cloudinit
from qemu.machine import QEMUMachine
from qemu.utils import get_info_usernet_hostfwd_port

import settings

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


class BaseTest(avocado.Test):
    arch = "aarch64"
    cpu = "cortex-A72"
    machine = "raspi3b"
    kernel_params = (
        "rw earlyprintk loglevel=8 console=ttyAMA0,115200 "
        "console=tty1 dwc_otg.lpm_enable=0 root=/dev/mmcblk0p2 "
        "rootdelay=1"
    )
    username = "root"
    password = "password"
    ssh_user = "radar"

    def tearDown(self):
        self.vm.shutdown(hard=True)

    def setUp(self) -> None:
        self.binary = f"/usr/local/bin/qemu-system-{self.arch}"
        self.qemu_img_binary = f"/usr/local/bin/qemu-img"
        self.dtb = settings.DTB_FILE
        self.kernel = settings.KERNEL_FILE
        self.setup_image()
        self.ssh_pub_key, self.ssh_key = self.setup_ssh_keys()
        self.vm = self._get_vm()
        self.vm.add_args(
            "-machine", "raspi3b",
            "-cpu", "cortex-a72",
            "-dtb", settings.DTB_FILE,
            "-m", "1G",
            "-smp", "4",
            "-kernel", settings.KERNEL_FILE,
            "-sd", settings.RADAR_IMAGE,
            "-serial", "stdio",
            "-netdev", "user,id=net1,hostfwd=tcp::2222-:22",
            "-device", "usb-net,netdev=net1",
            "-append", self.kernel_params
        )

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

    def set_up_cloudinit(self, ssh_pubkey=None):
        self.phone_server = cloudinit.PhoneHomeServer(('0.0.0.0', 0),
                                                      self.name)
        cloudinit_iso = self.prepare_cloudinit(ssh_pubkey)
        self.vm.add_args('-drive', 'file=%s,format=raw' % cloudinit_iso)

    def prepare_cloudinit(self, ssh_pubkey=None):
        self.log.info('Preparing cloudinit image')
        try:
            cloudinit_iso = os.path.join(self.workdir, 'cloudinit.iso')
            pubkey_content = None
            if ssh_pubkey:
                with open(ssh_pubkey) as pubkey:
                    pubkey_content = pubkey.read()
            cloudinit.iso(cloudinit_iso, self.name,
                          username=self.username,
                          password=self.password,
                          # QEMU's hard coded usermode router address
                          phone_home_host='10.0.2.2',
                          phone_home_port=self.phone_server.server_port,
                          authorized_key=pubkey_content)
        except Exception:
            self.cancel('Failed to prepare the cloudinit image')
        return cloudinit_iso

    def _get_vm(self):
        self.socket_dir = tempfile.mkdtemp(prefix="pods_os")
        self.log.info("Instantiating new machine from binary: %s", self.binary)
        vm = QEMUMachine(
            self.binary,
            base_temp_dir=self.workdir,
            sock_dir=self.socket_dir,
            log_dir=self.logdir
        )
        self.log.debug("New VM Spawned!")
        self.log.debug("Temp. Dir: %s\nLog Dir: %s", vm.temp_dir, vm.log_dir)
        return vm

    def ssh(self, key, user):
        self.ssh_session = ssh.Session(
            '127.0.0.1', port=2222, user=user, key=key
        )
        for i in range(5):
            try:
                self.ssh_session.connect()
                return self.ssh_session
            except:
                self.log.debug(
                    "Failed to connect through ssh -- Attempt %d of %d", 1, 5
                )
                time.sleep(i)
        self.fail(
            "Unable to connect through ssh to host at port %d and user %s",
            2222, user
        )

    def launch_and_wait(self, set_up_ssh_connection=True):
        self.vm.set_console()
        self.vm.launch()
        console_drainer = datadrainer.LineLogger(
            self.vm.console_socket.fileno(),
            logger=self.log
        )
        console_drainer.start()
        self.log.info('VM launched, waiting for boot confirmation from guest')

        if set_up_ssh_connection:
            self.log.info('Setting up the SSH connection')
            self.ssh(self.ssh_key, self.ssh_user)


class TestPods(BaseTest):
    timeout = 120

    def test_binaries_are_present(self):
        self.launch_and_wait(set_up_ssh_connection=False)
        session = self.ssh(self.ssh_key, self.ssh_user)
        res = session.cmd("ls /opt/radar")
        self.assertEqual(res.exit_status, 0)
        self.assertTrue("radar_agent" in res.stdout.decode())
        self.assertTrue("watchdog" in res.stdout.decode())

