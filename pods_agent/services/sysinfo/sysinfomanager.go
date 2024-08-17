package sysinfo

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"os/exec"
	"os/user"
	"path"
	"regexp"
	"slices"
	"strings"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
)

type SystemdStatusCode uint

const (
	statusRunning SystemdStatusCode = 0
)

type SysInfoManager struct {
	actLed string
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

	data, err := io.ReadAll(r)
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

func (si *SysInfoManager) Interfaces() (network.NetInterfaces, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, errors.Wrap(err, "net.Interfaces failed")
	}
	netInterfaces := make(network.NetInterfaces, 0)
	for _, iface := range ifaces {
		if iface.Name == "lo" {
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return nil, errors.Wrap(err, "iface.Addrs failed").WithMetadata(errors.Metadata{"iface": fmt.Sprintf("%v", iface)})
		}
		netInterfaces = append(netInterfaces, network.NetInterface{
			Name: iface.Name,
			MAC:  iface.HardwareAddr.String(),
			IPs:  addrs,
		})
	}
	return netInterfaces, nil
}

func (si *SysInfoManager) GetAuthLogFile() ([]byte, error) {
	res, err := si.readFile("/var/log/auth.log")
	if errors.Is(err, os.ErrNotExist) {
		// Try Journalctl then
		res, err := si.runCommand(exec.Command("journalctl", "-u", "systemd-logind"))
		if err != nil {
			return nil, errors.W(err)
		}
		return res, nil
	} else if err != nil {
		return nil, errors.W(err)
	}
	return res, nil
}

func (si *SysInfoManager) GetSysTimezone() (*time.Location, error) {

	out, err := si.runCommand(exec.Command("timedatectl", "--value", "-p", "Timezone", "show"))
	if err != nil {
		metadata := errors.GetMetadata(err)
		if metadata != nil && strings.Contains((*metadata)["stderr"].(string), "Connection timed out") {
			return nil, nil
		}
		return nil, errors.W(err)
	}
	locStr := strings.Trim(strings.TrimSpace(string(out)), "\n")
	loc, err := time.LoadLocation(locStr)
	if err != nil {
		return nil, errors.Wrap(err, "time.LoadLocation failed").WithMetadata(errors.Metadata{"location": locStr})
	}
	return loc, nil
}

func (si *SysInfoManager) SetSysTimezone(tz *time.Location) error {
	_, err := si.runCommand(exec.Command("timedatectl", "set-timezone", tz.String()))
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func (si *SysInfoManager) EnsureTailscale() error {
	if _, err := exec.LookPath("tailscale"); errors.Is(err, exec.ErrNotFound) {
		// Install it
		log.Println("sysinfo.SysInfoManager#EnsureTailscale: Tailscale not installed, installing it")

		_, err := si.runCommand(
			exec.Command("bash", "-c", "curl -fsSL https://tailscale.com/install.sh | sh"))

		if err != nil {
			// Leaving this validation commented out to get which pods are in a broken state.
			// metadata := errors.GetMetadata(err)
			// if metadata != nil && strings.Contains((*metadata)["stderr"].(string), "Unable to acquire the dpkg frontend lock") {
			// 	return nil
			// }
			if meta := errors.GetMetadata(err); meta != nil {
				m := *meta
				// In case of error related to APT files corrupted, all we need to do is to pick all reported files and delete them
				// And run an APT update afteward
				matcher := regexp.MustCompile(`Unable to parse package file\s(.*?)[\s\n]`)
				for _, match := range matcher.FindAllStringSubmatch(m["stderr"].(string), -1) {
					os.Remove(match[1])
				}
				_, err := si.runCommand(exec.Command("apt", "update"))
				if err != nil {
					return errors.W(err)
				}
			}
			return errors.W(err)
		}
		log.Println("sysinfo.SysInfoManager#EnsureTailscale: Tailscale installed, allowing auto-update")
		_, err = si.runCommand(
			exec.Command("tailscale", "set", "--auto-update"))
		if err != nil {
			return errors.W(err)
		}
		log.Println("sysinfo.SysInfoManager#EnsureTailscale: Tailscale installation completed.")
	}

	res, err := exec.Command("systemctl", "check", "tailscaled").Output()
	if err != nil || !strings.Contains(string(res), "active") {
		if err == nil {
			log.Printf("sysinfo.SysInfoManager#EnsureTailscale: Tailscale service not running: %s", string(res))
		} else {
			log.Printf("sysinfo.SysInfoManager#EnsureTailscale: Failed to check tailscale service: stdout: %s -- err: %s", string(res), err.Error())
		}
		log.Println("sysinfo.SysInfoManager#EnsureTailscale: Enabling Tailscale service")
		_, err = si.runCommand(exec.Command("systemctl", "enable", "tailscaled"))
		if err != nil {
			return errors.W(err)
		}
		log.Println("sysinfo.SysInfoManager#EnsureTailscale: Starting Tailscale service")
		_, err = si.runCommand(exec.Command("systemctl", "start", "tailscaled"))
		if err != nil {
			return errors.W(err)
		}
	}

	return nil
}

func (si *SysInfoManager) TailscaleUp(authKey string, tags []string) error {
	if err := si.EnsureTailscale(); err != nil {
		return errors.W(err)
	}
	log.Println("sysinfo.SysInfoManager#TailscaleUp: Starting Tailscale")
	_, err := si.runCommand(
		exec.Command("tailscale", "up", "--ssh", "--force-reauth", "--auth-key", authKey, "--advertise-tags", strings.Join(tags, ",")))
	if err != nil {
		return errors.W(err)
	}
	log.Println("sysinfo.SysInfoManager#TailscaleUp: Tailscale Started")
	return nil
}

func (si *SysInfoManager) TailscaleDown() error {
	log.Println("sysinfo.SysInfoManager#TailscaleDown: Stopping Tailscale")
	_, err := si.runCommand(exec.Command("tailscale", "down"))
	if errors.Is(err, exec.ErrNotFound) {
		return nil
	} else if err != nil {
		return errors.W(err)
	}
	_, err = si.runCommand(exec.Command("tailscale", "logout"))
	if err != nil {
		return errors.W(err)
	}
	log.Println("sysinfo.SysInfoManager#TailscaleDown: Tailscale Logged Out")
	_, err = si.runCommand(exec.Command("systemctl", "restart", "tailscaled"))
	if err != nil {
		return errors.W(err)
	}
	log.Println("sysinfo.SysInfoManager#TailscaleDown: Tailscale Service Restarted")
	return nil
}

func (si *SysInfoManager) TailscaleConnected() (bool, error) {
	res, err := si.runCommand(exec.Command("tailscale", "status", "--json"))
	if errors.Is(err, exec.ErrNotFound) {
		return false, nil
	} else if err != nil {
		return false, errors.W(err)
	}
	var status map[string]interface{}
	if err := json.Unmarshal(res, &status); err != nil {
		return false, errors.W(err)
	}
	return status["Self"].(map[string]interface{})["Online"].(bool), nil
}

func (si SysInfoManager) EnsureBinaryPermissions(path string) error {
	err := os.Chmod(path, 0755)
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func (si *SysInfoManager) EnsureUserGroups(userStr string, groups []string) (bool, error) {
	u, err := user.Lookup(userStr)
	if err != nil {
		return false, errors.W(err)
	}

	gids, err := u.GroupIds()
	if err != nil {
		return false, errors.W(err)
	}
	userGroups := make([]string, len(gids))
	for i, gid := range gids {
		g, err := user.LookupGroupId(gid)
		if err != nil {
			return false, errors.W(err)
		}
		userGroups[i] = g.Name
	}

	missingGroups := make([]string, 0)
	for _, group := range groups {
		if !slices.Contains(userGroups, group) {
			missingGroups = append(missingGroups, group)
			break
		}
	}

	if len(missingGroups) == 0 {
		return false, nil
	}
	log.Printf("sysinfo.SysInfoManager#EnsureUserGroups: User %s is missing groups %v\n", u.Username, missingGroups)
	_, err = si.runCommand(exec.Command("usermod", "-aG", strings.Join(missingGroups, ","), u.Username))
	if err != nil {
		return false, errors.W(err)
	}
	return true, nil
}

func (si *SysInfoManager) EnsurePathPermissions(path string, mode os.FileMode) error {
	info, err := os.Stat(path)
	if err != nil {
		return errors.W(err)

	}
	if info.Mode()&mode == mode {
		return nil
	}
	err = os.Chmod(path, mode)
	if err != nil {
		return errors.W(err)
	}
	return nil
}

// EnsureWifiEnabled checks if the wifi interface is unblocked and properly configured.
// The interface state is validated through `rfkill` command, and country code validated by reading wpa_supplicant.conf file.
func (si *SysInfoManager) EnsureWifiEnabled() error {
	// IMPORTANT NOTE: Pi OS Bookworm and onwards use NetworkManager instead of wpa_supplicant (nmcli)
	// See: https://www.raspberrypi.com/documentation/computers/configuration.html#connect-to-a-wireless-network

	out, err := si.runCommand(exec.Command("rfkill", "list", "wlan", "-no", "soft"))
	if err != nil {
		return errors.W(err)
	}
	if strings.TrimSpace(string(out)) != "unblocked" {
		// Enable Wifi interface
		_, err = si.runCommand(exec.Command("rfkill", "unblock", "wlan"))
		if err != nil {
			return errors.W(err)
		}
	}

	// Check if country code is set
	wpa_supplicant, err := os.Open("/etc/wpa_supplicant/wpa_supplicant.conf")
	if err != nil {
		return errors.W(err)
	}
	defer wpa_supplicant.Close()
	wpa_data, err := io.ReadAll(wpa_supplicant)
	if err != nil {
		return errors.W(err)
	}
	if !strings.Contains(string(wpa_data), "country=") {
		_, err := si.runCommand(exec.Command("raspi-config", "nonint", "do_wifi_country", "US"))
		if err != nil {
			return errors.W(err)
		}
	}
	return nil
}

func (si *SysInfoManager) EthernetStatus() (status network.NetStatus, err error) {
	status = network.Disconnected
	ifaces, err := network.Interfaces()
	if err != nil {
		return status, errors.W(err)
	}
	if eth := ifaces.FindByType(network.Ethernet); eth == nil {
		return status, nil
	} else {
		return eth.Details().Status, nil
	}
}

func (si *SysInfoManager) PodAgentRunning() (bool, error) {
	out, err := si.runCommand(exec.Command("systemctl", "is-active", "radar_agent"))
	exitErr := &exec.ExitError{}
	if err != nil && errors.As(err, &exitErr) && exitErr.ExitCode() != int(statusRunning) {
		return false, nil
	} else if err != nil {
		return false, errors.W(err)
	}
	return strings.TrimSpace(string(out)) == "active", nil
}

func (si *SysInfoManager) SetACTLED(status bool) error {
	if si.actLed == "" {
		if err := si.configureActLED(); err != nil {
			return errors.W(err)
		}
	}

	f, err := os.OpenFile(path.Join(si.actLed, "brightness"), os.O_RDWR, 0644)
	if err != nil {
		return errors.W(err)
	}
	val := "0"
	if status {
		val = "1"
	}
	f.Write([]byte(val))
	f.Close()
	return nil
}

func (si *SysInfoManager) configureActLED() error {
	leds, err := os.ReadDir("/sys/class/leds")
	if err != nil {
		return errors.W(err)
	}

	for _, led := range leds {
		if led.Name() == "ACT" || led.Name() == "led0" {
			si.actLed = path.Join("/sys/class/leds", led.Name())
			f, err := os.OpenFile(path.Join(si.actLed, "trigger"), os.O_RDWR, 0644)
			if err != nil {
				return errors.W(err)
			}
			f.Write([]byte("gpio"))
			f.Close()
			return nil
		}
	}
	return errors.New("no ACT LED found")
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
