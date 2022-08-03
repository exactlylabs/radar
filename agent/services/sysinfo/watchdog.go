package sysinfo

import (
	"log"
	"os/exec"
)

const WatchdogPath = "/opt/radar/watchdog"
const WatchdogServicePath = "/etc/systemd/system/podwatchdog@.service"

func GetWatchdogVersion() string {
	// we imply that watchdog is installed at /opt/radar/watchdog
	out, err := exec.Command(WatchdogPath, "-v").Output()
	if err != nil {
		log.Println("watchdog not found.")
		return ""
	}
	return string(out)
}
