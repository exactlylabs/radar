package watchdog

import (
	"bytes"
	_ "embed"
	"os"
	"os/exec"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/internal/update"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
)

func UpdateWatchdog(binaryUrl string, expectedVersion string) error {
	err := update.InstallFromUrl(sysinfo.WatchdogPath, binaryUrl, expectedVersion)
	if err != nil {
		return errors.W(err)
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
		return errors.Wrap(err, "failed to open file").WithMetadata(errors.Metadata{"path": sysinfo.WatchdogServicePath})
	}
	defer f.Close()
	serviceFile, err := OSFS.ReadFile("osfiles/etc/systemd/system/podwatchdog@.service")
	if err != nil {
		return errors.Wrap(err, "failed to read file").WithMetadata(errors.Metadata{"path": "osfiles/etc/systemd/system/podwatchdog@.service"})
	}
	if _, err := f.Write(serviceFile); err != nil {
		return errors.Wrap(err, "failed to write file").WithMetadata(errors.Metadata{
			"path": sysinfo.WatchdogServicePath, "content": string(serviceFile),
		})
	}
	cmd := exec.Command("sudo", "systemctl", "daemon-reload")
	stderr := new(bytes.Buffer)
	cmd.Stderr = stderr
	out, err := cmd.Output()
	if err != nil {
		return errors.Wrap(err, "failed to reload daemon").WithMetadata(errors.Metadata{
			"stderr": stderr.String(), "stdout": string(out),
		})
	}
	cmd = exec.Command("sudo", "systemctl", "enable", "podwatchdog@.service")
	stderr = new(bytes.Buffer)
	cmd.Stderr = stderr
	out, err = cmd.Output()
	if err != nil {
		return errors.Wrap(err, "failed to enable watchdog service").WithMetadata(errors.Metadata{
			"stderr": stderr.String(), "stdout": string(out),
		})
	}
	return nil
}
