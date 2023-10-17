package sysinfo

import (
	"bytes"
	"log"
	"os"
	"os/exec"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
)

const WatchdogPath = "/opt/radar/watchdog"
const WatchdogServicePath = "/etc/systemd/system/podwatchdog@.service"

func GetWatchdogVersion() string {
	// we imply that watchdog is installed at /opt/radar/watchdog
	if _, err := os.Stat(WatchdogPath); err != nil {
		log.Println("watchdog not found.")
		return ""
	}
	cmd := exec.Command(WatchdogPath, "-v")
	stderr := new(bytes.Buffer)
	cmd.Stderr = stderr
	out, err := cmd.Output()
	if err != nil {
		err = errors.Wrap(err, "error calling watchdog version: %s", string(out)).WithMetadata(errors.Metadata{
			"stderr": stderr.String(),
			"stdout": string(out),
			"binary": []string{WatchdogPath, "-v"},
		})
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
		log.Println(err)
		return ""
	}
	return string(out)
}

func WatchdogIsRunning() bool {
	out, err := exec.Command("systemctl", "check", "podwatchdog@tty1").Output()
	if err != nil {
		return false
	}
	return string(out) == "active\n"
}
