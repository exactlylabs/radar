package watchdog_test

import (
	"os"
	"testing"
	"time"

	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
	"github.com/exactlylabs/radar/pods_agent/watchdog"
	"github.com/exactlylabs/radar/pods_agent/watchdog/mocks"
)

//go:generate mockery

func mustReadFile(filePath string) []byte {
	val, err := watchdog.OSFS.ReadFile(filePath)
	if err != nil {
		panic(err)
	}
	return val
}

var utc, _ = time.LoadLocation("UTC")
var otherTz, _ = time.LoadLocation("America/Sao_Paulo")

func TestScanSystemNoChange(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetRadarAgentServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/radar_agent.service"), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("SystemStatus").Return(watchdog.SystemStatus{
		WlanStatus:      network.Disconnected,
		EthernetStatus:  network.Disconnected,
		PodAgentRunning: false,
	}, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := watchdog.NewScanner(m)
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
	m.On("GetRadarAgentServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/radar_agent.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetHostname", "1234").Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("SystemStatus").Return(watchdog.SystemStatus{
		WlanStatus:      network.Disconnected,
		EthernetStatus:  network.Disconnected,
		PodAgentRunning: false,
	}, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := watchdog.NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != watchdog.SystemFileChanged {
			t.Fatalf("expected a watchdog.SystemFileChanged event")
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
	m.On("GetRadarAgentServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/radar_agent.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetRCLocal", mustReadFile("osfiles/etc/rc.local")).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("SystemStatus").Return(watchdog.SystemStatus{
		WlanStatus:      network.Disconnected,
		EthernetStatus:  network.Disconnected,
		PodAgentRunning: false,
	}, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := watchdog.NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != watchdog.SystemFileChanged {
			t.Fatalf("expected a watchdog.SystemFileChanged event")
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
	m.On("GetRadarAgentServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/radar_agent.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetBootConfig", mustReadFile("osfiles/boot/config.txt")).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("SystemStatus").Return(watchdog.SystemStatus{
		WlanStatus:      network.Disconnected,
		EthernetStatus:  network.Disconnected,
		PodAgentRunning: false,
	}, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := watchdog.NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != watchdog.SystemFileChanged {
			t.Fatalf("expected a watchdog.SystemFileChanged event")
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
	m.On("GetRadarAgentServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/radar_agent.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetCMDLine", []byte("quiet splash rootwait logo.nologo vt.global_cursor_default=0 loglevel=0")).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("SystemStatus").Return(watchdog.SystemStatus{
		WlanStatus:      network.Disconnected,
		EthernetStatus:  network.Disconnected,
		PodAgentRunning: false,
	}, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := watchdog.NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != watchdog.SystemFileChanged {
			t.Fatalf("expected a watchdog.SystemFileChanged event")
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
	m.On("GetRadarAgentServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/radar_agent.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetLogindConf", mustReadFile("osfiles/etc/systemd/logind.conf")).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("SystemStatus").Return(watchdog.SystemStatus{
		WlanStatus:      network.Disconnected,
		EthernetStatus:  network.Disconnected,
		PodAgentRunning: false,
	}, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := watchdog.NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != watchdog.SystemFileChanged {
			t.Fatalf("expected a watchdog.SystemFileChanged event")
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
	m.On("GetRadarAgentServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/radar_agent.service"), nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("SetHostname", "1234").Return(nil)
	m.On("GetSysTimezone").Return(utc, nil)
	m.On("SetBootConfig", mustReadFile("osfiles/boot/config.txt")).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("SystemStatus").Return(watchdog.SystemStatus{
		WlanStatus:      network.Disconnected,
		EthernetStatus:  network.Disconnected,
		PodAgentRunning: false,
	}, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := watchdog.NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != watchdog.SystemFileChanged {
			t.Fatalf("expected a watchdog.SystemFileChanged event, got %v", evt.EventType)
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
	m.On("GetRadarAgentServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/radar_agent.service"), nil)
	m.On("GetSysTimezone").Return(otherTz, nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("SetSysTimezone", utc).Return(nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("SystemStatus").Return(watchdog.SystemStatus{
		WlanStatus:      network.Disconnected,
		EthernetStatus:  network.Disconnected,
		PodAgentRunning: false,
	}, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := watchdog.NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != watchdog.SystemFileChanged {
			t.Fatalf("expected a watchdog.SystemFileChanged event")
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
	m.On("GetRadarAgentServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/radar_agent.service"), nil)
	m.On("GetSysTimezone").Return(nil, nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("SystemStatus").Return(watchdog.SystemStatus{
		WlanStatus:      network.Disconnected,
		EthernetStatus:  network.Disconnected,
		PodAgentRunning: false,
	}, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := watchdog.NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		t.Fatalf("unexpected event: %v", evt)
	case <-time.NewTimer(1 * time.Second).C:
	}
}

func TestScanSystemStatusChanged(t *testing.T) {
	m := mocks.NewMockSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("GetWatchdogServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/podwatchdog@.service"), nil)
	m.On("GetRadarAgentServiceFile").Return(mustReadFile("osfiles/etc/systemd/system/radar_agent.service"), nil)
	m.On("GetSysTimezone").Return(nil, nil)
	m.On("GetAuthLogFile").Return([]byte(""), nil)
	m.On("EnsureTailscale").Return(nil)
	m.On("EnsureBinaryPermissions", "/opt/radar/watchdog").Return(nil)
	m.On("EnsurePathPermissions", "/tmp/tracing_buffer", os.FileMode(0777)).Return(nil)
	m.On("EnsureUserGroups", "radar", []string{"netdev"}).Return(false, nil)
	m.On("EnsureWifiEnabled").Return(nil)
	m.On("SystemStatus").Return(watchdog.SystemStatus{
		WlanStatus:      network.ConnectedNoInternet,
		EthernetStatus:  network.ConnectedWithInternet,
		PodAgentRunning: false,
	}, nil)
	c := &config.Config{}
	c.ClientId = "1234"
	scanner := watchdog.NewScanner(m)
	go scanner.ScanSystem(c)
	select {
	case evt := <-scanner.Events():
		if evt.EventType != watchdog.ConnectionStatusChanged {
			t.Fatalf("expected ConnectionStatusChanged, got %v", evt.EventType)
		}
		if data, ok := evt.Data.(map[string]network.NetStatus); !ok {
			t.Fatalf("expected event.Data to be of type watchdog.ConnectionsStatus, got %T", evt.Data)
		} else if data["ethernet"] != network.ConnectedWithInternet {
			t.Fatalf("expected Ethernet to be %v, got: %v", network.ConnectedWithInternet, data["ethernet"])
		} else if data["wlan"] != network.ConnectedNoInternet {
			t.Fatalf("expected Wlan.Status to be %v, got: %v", network.ConnectedNoInternet, data["wlan"])
		}

	case <-time.NewTimer(1 * time.Second).C:
		t.Fatalf("expected an event")
	}
}
