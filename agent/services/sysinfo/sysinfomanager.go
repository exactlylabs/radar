package sysinfo

import (
	"fmt"
	"io/ioutil"
	"net"
	"os"
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
		return nil, fmt.Errorf("sysInfoManager#readFile Open: %w", err)
	}
	defer r.Close()

	data, err := ioutil.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("sysInfoManager#readFile ReadAll: %w", err)
	}
	return data, nil
}

func (*SysInfoManager) writeFile(filePath string, content []byte) error {
	f, err := os.OpenFile(filePath, os.O_RDWR, 0640)
	if err != nil {
		return fmt.Errorf("sysInfoManager#writeFile OpenFile: %w", err)
	}
	defer f.Close()
	if err := f.Truncate(0); err != nil {
		return fmt.Errorf("sysInfoManager#writeFile Trucante: %w", err)
	}
	_, err = f.Write(content)
	if err != nil {
		return fmt.Errorf("sysInfoManager#writeFile Write: %w", err)
	}
	return nil
}

// GetBootConfig implements SystemManager
func (si *SysInfoManager) GetBootConfig() ([]byte, error) {
	return si.readFile("/boot/config.txt")
}

// GetCMDLine implements SystemManager
func (si *SysInfoManager) GetCMDLine() ([]byte, error) {
	return si.readFile("/boot/cmdline.txt")
}

// GetHostname implements SystemManager
func (si *SysInfoManager) GetHostname() (string, error) {
	hostname, err := si.readFile("/etc/hostname")
	if err != nil {
		return "", err
	}
	return string(hostname), err
}

// GetLogindConf implements SystemManager
func (si *SysInfoManager) GetLogindConf() ([]byte, error) {
	return si.readFile("/etc/systemd/logind.conf")
}

// GetRCLocal implements SystemManager
func (si *SysInfoManager) GetRCLocal() ([]byte, error) {
	return si.readFile("/etc/rc.local")
}

// Reboot implements SystemManager
func (*SysInfoManager) Reboot() error {
	// out, err := exec.Command("shutdown", "-r", "0").Output()
	// if err != nil {
	// 	if exitErr, ok := err.(*exec.ExitError); ok {
	// 		if exitErr.ExitCode() == 1 {
	// 			out, err = exec.Command("sudo", "shutdown", "-r", "0").Output()
	// 			if err == nil {
	// 				return nil
	// 			}
	// 		}
	// 	}
	// 	return fmt.Errorf("sysInfoManager#Reboot Output: %s: %w", string(out), err)
	// }
	return nil
}

// SetBootConfig implements SystemManager
func (si *SysInfoManager) SetBootConfig(data []byte) error {
	return si.writeFile("/boot/config.txt", data)
}

// SetCMDLine implements SystemManager
func (si *SysInfoManager) SetCMDLine(data []byte) error {
	return si.writeFile("/boot/cmdline.txt", data)
}

// SetHostname implements SystemManager
func (si *SysInfoManager) SetHostname(hostname string) error {
	return si.writeFile("/etc/hostname", []byte(hostname))
}

// SetLogindConf implements SystemManager
func (si *SysInfoManager) SetLogindConf(data []byte) error {
	return si.writeFile("/etc/systemd/logind.conf", data)
}

// SetRCLocal implements SystemManager
func (si *SysInfoManager) SetRCLocal(data []byte) error {
	return si.writeFile("/etc/rc.local", data)
}

func (si *SysInfoManager) Interfaces() ([]NetInterface, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, fmt.Errorf("pod.GetNetInterfaces Interfaces: %w", err)
	}
	netInterfaces := make([]NetInterface, 0)
	for _, iface := range ifaces {
		if iface.Name == "lo" {
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return nil, fmt.Errorf("pod.GetNetInterfaces Addrs: %w", err)
		}
		netInterfaces = append(netInterfaces, NetInterface{
			IfaceName: iface.Name,
			IfaceMac:  iface.HardwareAddr.String(),
			IfaceIps:  addrs,
		})
	}
	return netInterfaces, nil
}
