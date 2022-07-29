package update

import (
	_ "embed"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
)

//go:embed podwatchdog@.service
var watchdogServiceFile []byte

const watchdogServicePath = "/etc/systemd/system/podwatchdog@.service"
const WatchdogPath = "/opt/radar/watchdog"

func SelfUpdate(binaryUrl string) error {
	// Binary Validated, replace existing one with this
	binPath, err := os.Executable()
	if err != nil {
		return fmt.Errorf("update.SelfUpdate error obtaining binary path: %w", err)
	}

	binPath, err = filepath.EvalSymlinks(binPath)
	if err != nil {
		return fmt.Errorf("update.SelfUpdate error evaluating symlink: %w", err)
	}

	return InstallFromUrl(binPath, binaryUrl)
}

func UpdateWatchdog(binaryUrl string) error {
	err := InstallFromUrl(WatchdogPath, binaryUrl)
	if err != nil {
		return err
	}
	return installWatchdogService()
}

func InstallFromUrl(binPath, url string) error {
	res, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("update.InstallFromUrl Get: %w", err)
	}
	if res.StatusCode != 200 {
		return fmt.Errorf("update.InstallFromUrl unexpected status code: %w", err)
	}
	defer res.Body.Close()
	binary, err := ParseUpdateFile(res.Body)
	if err != nil {
		return err
	}
	if err := Install(binPath, binary); err != nil {
		return fmt.Errorf("update.InstallFromUrl Install: %w", err)
	}
	return nil
}

// Install adds or replaces the watchdog binary into the OS,
// as well as configures systemd
func Install(binPath string, binary []byte) error {
	if _, err := os.Stat(binPath); errors.Is(err, os.ErrNotExist) {
		return addBinary(binPath, binary)
	}
	return replaceBinary(binPath, binary)
}

func addBinary(binPath string, binary []byte) error {
	f, err := os.OpenFile(binPath, os.O_CREATE|os.O_RDWR, 0776)
	if err != nil {
		return fmt.Errorf("watchdog.Install OpenFile: %w", err)
	}
	defer f.Close()
	_, err = f.Write(binary)
	if err != nil {
		return fmt.Errorf("watchdog.Install Write: %w", err)
	}
	return nil
}

func replaceBinary(binPath string, binary []byte) error {
	tmpFile := fmt.Sprintf("%s_tmp", binPath)
	oldFile := fmt.Sprintf("%s_old", binPath)
	f, err := os.OpenFile(tmpFile, os.O_RDWR, 0776)
	if err != nil {
		return fmt.Errorf("watchdog.Install OpenFile: %w", err)
	}
	defer f.Close()
	n, err := f.Write(binary)
	if err != nil {
		return fmt.Errorf("watchdog.Install Write: %w", err)
	}
	log.Printf("Copied %d Bytes\n", n)
	f.Close()
	if err = os.Rename(binPath, oldFile); err != nil {
		return fmt.Errorf("update.Install Rename: %w", err)
	}
	// // Replace existing binary with new one
	if err = os.Rename(tmpFile, binPath); err != nil {
		os.Rename(oldFile, binPath)
		return fmt.Errorf("update.Install Rename: %w", err)
	}
	os.Remove(oldFile)
	os.Chmod(binPath, 0776)
	return nil
}

// installWatchdogService removes getty@.service and installs watchdog@.service
func installWatchdogService() error {
	out, err := exec.Command("systemctl", "disable", "getty@.service").Output()
	if err != nil {
		return fmt.Errorf("update.installWatchdogService Disable %v: %w", out, err)
	}
	f, err := os.OpenFile(watchdogServicePath, os.O_CREATE|os.O_RDWR, 0644)
	if err != nil {
		return fmt.Errorf("update.installWatchdogService OpenFile: %w", err)
	}
	defer f.Close()
	if _, err := f.Write(watchdogServiceFile); err != nil {
		return fmt.Errorf("update.installWatchdogService Write: %w", err)
	}
	out, err = exec.Command("systemctl", "daemon-reload").Output()
	if err != nil {
		return fmt.Errorf("update.installWatchdogService DaemonReload %v: %w", out, err)
	}
	out, err = exec.Command("systemctl", "enable", "getty@.service").Output()
	if err != nil {
		return fmt.Errorf("update.installWatchdogService Enable %v: %w", out, err)
	}
	return nil
}
