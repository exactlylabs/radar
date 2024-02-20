package watchdog

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
)

var cmdLineCommands = []string{
	"quiet", "splash", "rootwait", "logo.nologo",
	"vt.global_cursor_default=0", "loglevel=0",
}

var utc, _ = time.LoadLocation("UTC")

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
				err = errors.W(err)
				sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
				log.Println(err)
			} else if hasChanges {
				if err := sysEditor.Reboot(); err != nil {
					// Panic?
					err = errors.W(err)
					sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
					log.Println(err)
				}
			}
		}
	}
}

var previousAuthLogTime time.Time = time.Now()

// ScanSystem looks through the system
// verifying and modifying files based on the expected state.
// It returns True if any file was changed
func ScanSystem(c *config.Config, sysManager SystemManager) (bool, error) {
	hasChanges := 0

	// Validate Hostname
	hostname, err := sysManager.GetHostname()
	if err != nil {
		return false, errors.W(err)
	}
	if c.ClientId != "" && hostname != c.ClientId {
		if err := sysManager.SetHostname(c.ClientId); err != nil {
			return false, errors.W(err)
		}
		log.Printf("Hostname replaced to %s due to it being different from the expected\n", c.ClientId)
		hasChanges = 1
	}

	// Validate rc.local file
	changed, err := checkAndReplace("osfiles/etc/rc.local", sysManager.GetRCLocal, sysManager.SetRCLocal)
	if err != nil {
		return false, nil
	}
	hasChanges |= changed

	// // Validate config.txt file
	changed, err = checkAndReplace("osfiles/boot/config.txt", sysManager.GetBootConfig, sysManager.SetBootConfig)
	if err != nil {
		return false, errors.W(err)
	}
	hasChanges |= changed

	// // Validate cmdline.txt
	changed, err = checkAndUpdateCMDLine(sysManager, cmdLineCommands)
	if err != nil {
		return false, errors.W(err)
	}
	hasChanges |= changed

	// Validate logind.conf
	changed, err = checkAndReplace("osfiles/etc/systemd/logind.conf", sysManager.GetLogindConf, sysManager.SetLogindConf)
	if err != nil {
		return false, errors.W(err)
	}
	hasChanges |= changed

	// Validate podwatchdog@.service
	changed, err = checkAndReplace("osfiles/etc/systemd/system/podwatchdog@.service", sysManager.GetWatchdogServiceFile, sysManager.SetWatchdogServiceFile)
	if err != nil {
		return false, errors.W(err)
	}
	hasChanges |= changed

	// Validate that the system is set to UTC
	tz, err := sysManager.GetSysTimezone()
	if err != nil {
		return false, errors.W(err)
	}
	if tz != nil && tz.String() != "UTC" {
		if err := sysManager.SetSysTimezone(utc); err != nil {
			return false, errors.W(err)
		}
		hasChanges = 1
	}

	// Ensures that Tailscale is installed
	if err := sysManager.EnsureTailscale(); err != nil {
		return false, errors.W(err)
	}

	if err := sysManager.EnsureBinaryPermissions(sysinfo.WatchdogPath); err != nil {
		return false, errors.W(err)
	}

	// Make sure that sentry buffer allows other users to write (radar user)
	sysManager.EnsurePathPermissions("/tmp/tracing_buffer", 0777)

	// Grant netdev to radar user, so it can use wpa_supplicant.
	if changed, err := sysManager.EnsureUserGroups("radar", []string{"netdev"}); err != nil {
		return false, errors.W(err)
	} else if changed {
		hasChanges = 1
	}

	if err := sysManager.EnsureWifiEnabled(); err != nil {
		return false, errors.W(err)
	}

	authLog, err := sysManager.GetAuthLogFile()
	if err != nil {
		return false, errors.W(err)
	}
	loginEvents, err := scanAuthLog(c, authLog, previousAuthLogTime)
	if err != nil {
		return false, errors.W(err)
	}
	for _, evt := range loginEvents {
		if previousAuthLogTime.Before(evt.Time) {
			previousAuthLogTime = evt.Time
		}
		log.Printf("New Login Detected at %v, notifying through tracing\n", evt.Time)
		sentry.NotifyError(
			errors.NewWithType("new Login Detected in the Pod", "Login Detected"),
			map[string]sentry.Context{
				"Login Info": {"User": evt.User, "Time": evt.Time, "Unix User": c.ClientId},
			},
		)
	}

	return hasChanges > 0, nil
}

// checkAndUpdateCMDLine goes through the kernel commands and make sure that the provided commands are there
func checkAndUpdateCMDLine(sysManager SystemManager, arguments []string) (int, error) {
	cmdLine, err := sysManager.GetCMDLine()
	if err != nil {
		return 0, errors.W(err)
	}

	commands := bytes.Split(bytes.Trim(cmdLine, "\n"), []byte(" "))
	added := false
	for _, cmd := range arguments {
		if !isIn([]byte(cmd), commands) {
			commands = append(commands, []byte(cmd))
			added = true
		}
	}
	if added {
		if err := sysManager.SetCMDLine(bytes.Trim(bytes.Join(commands, []byte(" ")), " ")); err != nil {
			return 0, fmt.Errorf("watchdog.ScanSystem SetCMDLine: %w", err)
		}
		return 1, nil
	}
	return 0, nil
}

func isIn(target []byte, arr [][]byte) bool {
	for _, obj := range arr {
		if bytes.Equal(target, obj) {
			return true
		}
	}
	return false
}

func checkAndReplace(filePath string, getter func() ([]byte, error), setter func([]byte) error) (int, error) {
	expected, err := OSFS.ReadFile(filePath)
	if err != nil {
		return 0, errors.Wrap(err, "error reading file").WithMetadata(errors.Metadata{"filePath": filePath})
	}
	current, err := getter()
	if err != nil {
		return 0, errors.W(err)
	}
	if !bytes.Equal(current, expected) {
		if err := setter(expected); err != nil {
			return 0, errors.W(err)
		}
		log.Printf("File %s was replaced due to it being different from the expected\n", filePath)
		return 1, nil
	}
	return 0, nil
}
