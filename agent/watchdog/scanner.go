package watchdog

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"time"

	"github.com/exactlylabs/radar/agent/config"
)

// StartScanLoop is a blocking function that keeps monitoring the system,
// checking it's health and files to update
func StartScanLoop(ctx context.Context, sysEditor SystemManager) {
	timer := time.NewTicker(time.Second * 10)
	for {
		select {
		case <-ctx.Done():
			return
		case <-timer.C:
			c := config.Reload()
			hasChanges, err := ScanSystem(c, sysEditor)
			if err != nil {
				// Panic?
				log.Println(err)
			} else if hasChanges {
				if err := sysEditor.Reboot(); err != nil {
					// Panic?
					log.Println(err)
				}
			}
		}
	}
}

// ScanSystem looks through the system
// verifying and modifying files based on the expected state.
// It returns True if any file was changed
func ScanSystem(c *config.Config, sysManager SystemManager) (bool, error) {
	errMsg := func(err error, call string) error {
		return fmt.Errorf("watchog.ScanSystem %v: %w", call, err)
	}
	hasChanges := 0

	// Validate Hostname
	hostname, err := sysManager.GetHostname()
	if err != nil {
		return false, errMsg(err, "GeHostname")
	}
	if c.ClientId != "" && hostname != c.ClientId {
		if err := sysManager.SetHostname(c.ClientId); err != nil {
			return false, errMsg(err, "SetHostname")
		}
		hasChanges = 1
	}

	// Validate rc.local file
	changed, err := checkAndReplace("osfiles/etc/rc.local", sysManager.GetRCLocal, sysManager.SetRCLocal)
	if err != nil {
		return false, nil
	}
	hasChanges |= changed

	// Validate config.txt file
	changed, err = checkAndReplace("osfiles/boot/config.txt", sysManager.GetBootConfig, sysManager.SetBootConfig)
	if err != nil {
		return false, err
	}
	hasChanges |= changed

	// Validate cmdline.txt
	changed, err = checkAndReplace("osfiles/boot/cmdline.txt", sysManager.GetCMDLine, sysManager.SetCMDLine)
	if err != nil {
		return false, err
	}
	hasChanges |= changed

	// Validate logind.conf
	changed, err = checkAndReplace("osfiles/etc/systemd/logind.conf", sysManager.GetLogindConf, sysManager.SetLogindConf)
	if err != nil {
		return false, err
	}
	hasChanges |= changed

	return hasChanges > 0, nil
}

func checkAndReplace(filePath string, getter func() ([]byte, error), setter func([]byte) error) (int, error) {
	errMsg := func(err error, call string) error {
		return fmt.Errorf("watchog.ScanSystem %v: %w", call, err)
	}
	expected, err := OSFS.ReadFile(filePath)
	if err != nil {
		return 0, errMsg(err, "ReadFile")
	}
	current, err := getter()
	if err != nil {
		return 0, errMsg(err, "getter")
	}
	if !bytes.Equal(current, expected) {
		if err := setter(expected); err != nil {
			return 0, errMsg(err, "setter")
		}
		return 1, nil
	}
	return 0, nil
}
