package sysinfo

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

type SysInfoManager struct {
}

// NewSystemManager returns an implementation of SystemManager using sysinfo service
func NewSystemManager() *SysInfoManager {
	return &SysInfoManager{}
}

func (*SysInfoManager) readFile(filePath string) ([]byte, error) {
	r, err := os.Open(filePath)
	if err != nil {
		return nil, errors.Wrap(err, "open file failed").WithMetadata(errors.Metadata{"file": filePath})
	}
	defer r.Close()

	data, err := ioutil.ReadAll(r)
	if err != nil {
		return nil, errors.Wrap(err, "failed to read file").WithMetadata(errors.Metadata{"file": filePath})
	}
	return data, nil
}

func (*SysInfoManager) writeFile(filePath string, content []byte) error {
	f, err := os.OpenFile(filePath, os.O_RDWR, 0640)
	if err != nil {
		return errors.Wrap(err, "open file failed").WithMetadata(errors.Metadata{"file": filePath})
	}
	defer f.Close()
	if err := f.Truncate(0); err != nil {
		return errors.Wrap(err, "truncate file failed").WithMetadata(errors.Metadata{"file": filePath})
	}
	_, err = f.Write(content)
	if err != nil {
		return errors.Wrap(err, "write file failed").WithMetadata(errors.Metadata{"file": filePath, "content": string(content)})
	}
	return nil
}

// GetBootConfig implements SystemManager
func (si *SysInfoManager) GetBootConfig() ([]byte, error) {
	res, err := si.readFile("/boot/config.txt")
	if err != nil {
		return nil, errors.W(err)
	}
	return res, nil
}

// GetCMDLine implements SystemManager
func (si *SysInfoManager) GetCMDLine() ([]byte, error) {
	res, err := si.readFile("/boot/cmdline.txt")
	if err != nil {
		return nil, errors.W(err)
	}
	return res, nil
}

// GetHostname implements SystemManager
func (si *SysInfoManager) GetHostname() (string, error) {
	hostname, err := si.readFile("/etc/hostname")
	if err != nil {
		return "", errors.W(err)
	}
	return string(hostname), nil
}

// GetLogindConf implements SystemManager
func (si *SysInfoManager) GetLogindConf() ([]byte, error) {
	res, err := si.readFile("/etc/systemd/logind.conf")
	if err != nil {
		return nil, errors.W(err)
	}
	return res, nil
}

func (si *SysInfoManager) GetWatchdogServiceFile() ([]byte, error) {
	res, err := si.readFile("/etc/systemd/system/podwatchdog@.service")
	if err != nil {
		return nil, errors.W(err)
	}
	return res, nil
}

// GetRCLocal implements SystemManager
func (si *SysInfoManager) GetRCLocal() ([]byte, error) {
	res, err := si.readFile("/etc/rc.local")
	if err != nil {
		return nil, errors.W(err)
	}
	return res, nil
}

// Reboot implements SystemManager
func (*SysInfoManager) Reboot() error {
	cmd := exec.Command("shutdown", "-r", "0")
	stderr := new(bytes.Buffer)
	cmd.Stderr = stderr
	out, err := cmd.Output()
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			if exitErr.ExitCode() == 1 {
				out, err = exec.Command("sudo", "shutdown", "-r", "0").Output()
				if err == nil {
					return nil
				}
			}
		}
		return errors.Wrap(err, "failed to reboot").WithMetadata(errors.Metadata{"stderr": stderr.String(), "stdout": string(out)})
	}
	return nil
}

// SetBootConfig implements SystemManager
func (si *SysInfoManager) SetBootConfig(data []byte) error {
	err := si.writeFile("/boot/config.txt", data)
	if err != nil {
		return errors.W(err)
	}
	return nil
}

// SetCMDLine implements SystemManager
func (si *SysInfoManager) SetCMDLine(data []byte) error {
	err := si.writeFile("/boot/cmdline.txt", data)
	if err != nil {
		return errors.W(err)
	}
	return nil
}

// SetHostname implements SystemManager
func (si *SysInfoManager) SetHostname(hostname string) error {
	err := si.writeFile("/etc/hostname", []byte(hostname))
	if err != nil {
		return errors.W(err)
	}
	return nil
}

// SetLogindConf implements SystemManager
func (si *SysInfoManager) SetLogindConf(data []byte) error {
	err := si.writeFile("/etc/systemd/logind.conf", data)
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func (si *SysInfoManager) SetWatchdogServiceFile(data []byte) error {
	err := si.writeFile("/etc/systemd/system/podwatchdog@.service", data)
	if err != nil {
		return errors.W(err)
	}
	return nil
}

// SetRCLocal implements SystemManager
func (si *SysInfoManager) SetRCLocal(data []byte) error {
	err := si.writeFile("/etc/rc.local", data)
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func (si *SysInfoManager) Interfaces() ([]NetInterface, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, errors.Wrap(err, "net.Interfaces failed")
	}
	netInterfaces := make([]NetInterface, 0)
	for _, iface := range ifaces {
		if iface.Name == "lo" {
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return nil, errors.Wrap(err, "iface.Addrs failed").WithMetadata(errors.Metadata{"iface": fmt.Sprintf("%v", iface)})
		}
		netInterfaces = append(netInterfaces, NetInterface{
			IfaceName: iface.Name,
			IfaceMac:  iface.HardwareAddr.String(),
			IfaceIps:  addrs,
		})
	}
	return netInterfaces, nil
}

func (si SysInfoManager) GetAuthLogFile() ([]byte, error) {
	res, err := si.readFile("/var/log/auth.log")
	if err != nil {
		return nil, errors.W(err)
	}
	return res, nil
}

func (si SysInfoManager) GetSysTimezone() (*time.Location, error) {

	out, err := si.runCommand(exec.Command("timedatectl", "--value", "-p", "Timezone", "show"))
	if err != nil {
		return nil, errors.W(err)
	}
	locStr := strings.Trim(strings.TrimSpace(string(out)), "\n")
	loc, err := time.LoadLocation(locStr)
	if err != nil {
		return nil, errors.Wrap(err, "time.LoadLocation failed").WithMetadata(errors.Metadata{"location": locStr})
	}
	return loc, nil
}

func (si SysInfoManager) SetSysTimezone(tz *time.Location) error {
	_, err := si.runCommand(exec.Command("timedatectl", "set-timezone", tz.String()))
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func (si SysInfoManager) runCommand(cmd *exec.Cmd) ([]byte, error) {
	stdout := bytes.NewBuffer(nil)
	stderr := bytes.NewBuffer(nil)
	cmd.Stdout = stdout
	cmd.Stderr = stderr
	if err := cmd.Run(); err != nil {
		return nil, errors.Wrap(err, "cmd.Run failed: %s", stdout.String()).WithMetadata(errors.Metadata{
			"stderr": stderr.String(), "stdout": stdout.String(),
		})
	}
	return stdout.Bytes(), nil
}
