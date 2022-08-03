package watchdog

import (
	_ "embed"
	"fmt"
	"os"
	"os/exec"

	"github.com/exactlylabs/radar/agent/internal/update"
	"github.com/exactlylabs/radar/agent/services/sysinfo"
)

func UpdateWatchdog(binaryUrl string) error {
	err := update.InstallFromUrl(sysinfo.WatchdogPath, binaryUrl)
	if err != nil {
		return err
	}
	return installWatchdogService()
}

// installWatchdogService removes getty@.service and installs watchdog@.service
func installWatchdogService() error {
	exec.Command("sudo", "systemctl", "disable", "getty@.service").Output()

	// create file with RW-RW-R and group radar
	exec.Command("sudo", "install", "-m", "0664", "-g", "1000", "/dev/null", "/etc/systemd/system/podwatchdog@.service").Output()
	f, err := os.OpenFile(sysinfo.WatchdogServicePath, os.O_CREATE|os.O_RDWR, 0644)
	if err != nil {
		return fmt.Errorf("watchdog.installWatchdogService OpenFile: %w", err)
	}
	defer f.Close()
	serviceFile, err := OSFS.ReadFile("osfiles/etc/systemd/system/podwatchdog@.service")
	if err != nil {
		return fmt.Errorf("watchdog.installWatchdogService ReadFile: %w", err)
	}
	if _, err := f.Write(serviceFile); err != nil {
		return fmt.Errorf("watchdog.installWatchdogService Write: %w", err)
	}
	out, err := exec.Command("sudo", "systemctl", "daemon-reload").Output()
	if err != nil {
		return fmt.Errorf("watchdog.installWatchdogService DaemonReload %v: %w", out, err)
	}
	out, err = exec.Command("sudo", "systemctl", "enable", "podwatchdog@.service").Output()
	if err != nil {
		return fmt.Errorf("watchdog.installWatchdogService Enable %v: %w", out, err)
	}
	return nil
}
