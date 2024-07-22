package watchdog

import (
	"os"
	"strings"
	"testing"
	"time"

	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
	"github.com/exactlylabs/radar/pods_agent/watchdog/mocks"
)

//go:generate mockery

func mustReadFile(filePath string) []byte {
	val, err := OSFS.ReadFile(filePath)
	if err != nil {
		panic(err)
	}
	return val
}

var otherTz, _ = time.LoadLocation("America/Sao_Paulo")

func TestScanSystemNoChange(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("PodAgentRunning").Return(false, nil)
	m.On("EthernetStatus").Return(network.Disconnected, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		t.Fatal("unexpected event: ", evt)
	case <-time.NewTimer(1 * time.Second).C:
	}

}

func TestScanSystemHostDiffers(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("Test", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetHostname", "1234").Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("PodAgentRunning").Return(false, nil)
	m.On("EthernetStatus").Return(network.Disconnected, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != SystemFileChanged {
			t.Fatalf("expected a SystemFileChanged event")
		}
	case <-time.NewTimer(1 * time.Second).C:
		t.Fatalf("expected an event")
	}
}

func TestScanSystemRCLocalDiffers(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return([]byte{1, 2}, nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetRCLocal", mustReadFile("osfiles/etc/rc.local")).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("PodAgentRunning").Return(false, nil)
	m.On("EthernetStatus").Return(network.Disconnected, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != SystemFileChanged {
			t.Fatalf("expected a SystemFileChanged event")
		}
	case <-time.NewTimer(1 * time.Second).C:
		t.Fatalf("expected an event")
	}
}

func TestScanSystemBootConfigDiffers(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return([]byte{1, 2, 3}, nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetBootConfig", mustReadFile("osfiles/boot/config.txt")).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("PodAgentRunning").Return(false, nil)
	m.On("EthernetStatus").Return(network.Disconnected, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != SystemFileChanged {
			t.Fatalf("expected a SystemFileChanged event")
		}
	case <-time.NewTimer(1 * time.Second).C:
		t.Fatalf("expected an event")
	}
}

func TestScanSystemCMDLineDiffers(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return([]byte{}, nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetCMDLine", []byte(strings.Join(cmdLineCommands, " "))).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("PodAgentRunning").Return(false, nil)
	m.On("EthernetStatus").Return(network.Disconnected, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != SystemFileChanged {
			t.Fatalf("expected a SystemFileChanged event")
		}
	case <-time.NewTimer(1 * time.Second).C:
		t.Fatalf("expected an event")
	}
}

func TestScanSystemLogindDiffers(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return([]byte("test"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetLogindConf", mustReadFile("osfiles/etc/systemd/logind.conf")).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("PodAgentRunning").Return(false, nil)
	m.On("EthernetStatus").Return(network.Disconnected, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != SystemFileChanged {
			t.Fatalf("expected a SystemFileChanged event")
		}
	case <-time.NewTimer(1 * time.Second).C:
		t.Fatalf("expected an event")
	}
}

func TestScanSystemMultipleChanged(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("aa", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return([]byte("test"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("SetHostname", "1234").Return(nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetBootConfig", mustReadFile("osfiles/boot/config.txt")).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("PodAgentRunning").Return(false, nil)
	m.On("EthernetStatus").Return(network.Disconnected, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != SystemFileChanged {
			t.Fatalf("expected a SystemFileChanged event")
		}
	case <-time.NewTimer(1 * time.Second).C:
		t.Fatalf("expected an event")
	}
}

func TestScanSystemTimeZoneChanged(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetSysTimezone").Return(otherTz, nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("SetSysTimezone", utc).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("PodAgentRunning").Return(false, nil)
	m.On("EthernetStatus").Return(network.Disconnected, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != SystemFileChanged {
			t.Fatalf("expected a SystemFileChanged event")
		}
	case <-time.NewTimer(1 * time.Second).C:
		t.Fatalf("expected an event")
	}
}

func TestScanSystemTimeZoneReturnedNilNoChange(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetSysTimezone").Return(nil, nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("PodAgentRunning").Return(false, nil)
	m.On("EthernetStatus").Return(network.Disconnected, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		t.Fatalf("unexpected event: %v", evt)
	case <-time.NewTimer(1 * time.Second).C:
	}
}
