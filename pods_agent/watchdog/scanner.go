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
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
)

var cmdLineCommands = []string{
	"quiet", "splash", "rootwait", "logo.nologo",
	"vt.global_cursor_default=0", "loglevel=0",
}

var utc, _ = time.LoadLocation("UTC")

type Scanner struct {
	status     SystemStatus
	eventsCh   chan SystemEvent
	sysManager SystemManager
}

func NewScanner(sysManager SystemManager) *Scanner {
	return &Scanner{
		status: SystemStatus{
			EthernetStatus:  network.Disconnected,
			PodAgentRunning: false,
		},
		sysManager: sysManager,
		eventsCh:   make(chan SystemEvent),
	}
}

func (s *Scanner) Events() <-chan SystemEvent {
	return s.eventsCh
}

func (s *Scanner) SystemStatus() SystemStatus {
	return s.status
}

// StartScanLoop is a blocking function that keeps monitoring the system,
// checking it's health and files to update
func (s *Scanner) StartScanLoop(ctx context.Context) {
	timer := time.NewTicker(time.Second * 10)
	for {
		select {
		case <-ctx.Done():
			return
		case <-timer.C:
			c := config.Reload()
			err := s.ScanSystem(c)
			if err != nil {
				// Panic?
				err = errors.W(err)
				sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
				log.Println(err)
			}
		}
	}
}

var previousAuthLogTime time.Time = time.Now()

// ScanSystem looks through the system
// verifying and modifying files based on the expected state.
// It returns True if any file was changed
func (s *Scanner) ScanSystem(c *config.Config) error {
	hasChanges := 0

	// Validate Hostname
	hostname, err := s.sysManager.GetHostname()
	if err != nil {
		return errors.W(err)
	}
	if c.ClientId != "" && hostname != c.ClientId {
		if err := s.sysManager.SetHostname(c.ClientId); err != nil {
			return errors.W(err)
		}
		log.Printf("Hostname replaced to %s due to it being different from the expected\n", c.ClientId)
		hasChanges = 1
	}

	// Validate rc.local file
	changed, err := checkAndReplace("osfiles/etc/rc.local", s.sysManager.GetRCLocal, s.sysManager.SetRCLocal)
	if err != nil {
		return nil
	}
	hasChanges |= changed

	// // Validate config.txt file
	changed, err = checkAndReplace("osfiles/boot/config.txt", s.sysManager.GetBootConfig, s.sysManager.SetBootConfig)
	if err != nil {
		return errors.W(err)
	}
	hasChanges |= changed

	// // Validate cmdline.txt
	changed, err = checkAndUpdateCMDLine(s.sysManager, cmdLineCommands)
	if err != nil {
		return errors.W(err)
	}
	hasChanges |= changed

	// Validate logind.conf
	changed, err = checkAndReplace("osfiles/etc/systemd/logind.conf", s.sysManager.GetLogindConf, s.sysManager.SetLogindConf)
	if err != nil {
		return errors.W(err)
	}
	hasChanges |= changed

	// Validate podwatchdog@.service
	changed, err = checkAndReplace("osfiles/etc/systemd/system/podwatchdog@.service", s.sysManager.GetWatchdogServiceFile, s.sysManager.SetWatchdogServiceFile)
	if err != nil {
		return errors.W(err)
	}
	hasChanges |= changed

	// Validate radar_agent.service
	changed, err = checkAndReplace("osfiles/etc/systemd/system/radar_agent.service", s.sysManager.GetRadarAgentServiceFile, s.sysManager.SetRadarAgentServiceFile)
	if err != nil {
		return errors.W(err)
	}
	hasChanges |= changed

	// Validate that the system is set to UTC
	tz, err := s.sysManager.GetSysTimezone()
	if err != nil {
		return errors.W(err)
	}
	if tz != nil && tz.String() != "UTC" {
		if err := s.sysManager.SetSysTimezone(utc); err != nil {
			return errors.W(err)
		}
		hasChanges = 1
	}

	// Ensures that Tailscale is installed
	if err := s.sysManager.EnsureTailscale(); err != nil {
		return errors.W(err)
	}

	if err := s.sysManager.EnsureBinaryPermissions(sysinfo.WatchdogPath); err != nil {
		return errors.W(err)
	}

	// Make sure that sentry buffer allows other users to write (radar user)
	s.sysManager.EnsurePathPermissions("/tmp/tracing_buffer", 0777)

	// Grant netdev to radar user, so it can use wpa_supplicant.
	if changed, err := s.sysManager.EnsureUserGroups("radar", []string{"netdev"}); err != nil {
		return errors.W(err)
	} else if changed {
		hasChanges = 1
	}

	if err := s.sysManager.EnsureWifiEnabled(); err != nil {
		return errors.W(err)
	}

	// Login Detection
	authLog, err := s.sysManager.GetAuthLogFile()
	if err != nil {
		return errors.W(err)
	}
	loginEvents, err := scanAuthLog(c, authLog, previousAuthLogTime)
	if err != nil {
		return errors.W(err)
	}
	for _, evt := range loginEvents {
		if previousAuthLogTime.Before(evt.Time) {
			previousAuthLogTime = evt.Time
		}
		s.eventsCh <- SystemEvent{
			EventType: LoginDetected,
			Data:      evt,
		}
	}

	// Agent Status Change Detection
	agentRunning, err := s.sysManager.PodAgentRunning()
	if err != nil {
		return errors.W(err)
	}

	if agentRunning != s.status.PodAgentRunning {
		s.status.PodAgentRunning = agentRunning
		s.eventsCh <- SystemEvent{
			EventType: AgentStatusChanged,
			Data:      agentRunning,
		}
	}

	// Ethernet Status Change Detection
	ethernetStatus, err := s.sysManager.EthernetStatus()
	if err != nil {
		return errors.W(err)
	}
	if ethernetStatus != s.status.EthernetStatus {
		s.status.EthernetStatus = ethernetStatus
		s.eventsCh <- SystemEvent{
			EventType: EthernetStatusChanged,
			Data:      ethernetStatus,
		}
	}

	if hasChanges > 0 {
		s.eventsCh <- SystemEvent{
			EventType: SystemFileChanged,
		}
	}

	return nil
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
