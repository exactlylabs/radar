package watchdog

import (
	"strings"
	"testing"

	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/watchdog/mocks"
)

func mustReadFile(filePath string) []byte {
	val, err := OSFS.ReadFile(filePath)
	if err != nil {
		panic(err)
	}
	return val
}

func TestScanSystemNoChange(t *testing.T) {
	m := mocks.NewSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	c := &config.Config{}
	c.ClientId = "1234"
	hasChanged, err := ScanSystem(c, m)
	if err != nil {
		t.Fatal(err)
	}
	if hasChanged {
		t.Fatalf("expected nothing to change")
	}
}

func TestScanSystemHostDiffers(t *testing.T) {
	m := mocks.NewSystemManager(t)
	m.On("GetHostname").Return("Test", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("SetHostname", "1234").Return(nil)
	c := &config.Config{}
	c.ClientId = "1234"
	hasChanged, err := ScanSystem(c, m)
	if err != nil {
		t.Fatal(err)
	}
	if !hasChanged {
		t.Fatal("ScanSystem didn't return that it has changed")
	}
}

func TestScanSystemRCLocalDiffers(t *testing.T) {
	m := mocks.NewSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return([]byte{1, 2}, nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("SetRCLocal", mustReadFile("osfiles/etc/rc.local")).Return(nil)
	c := &config.Config{}
	c.ClientId = "1234"
	hasChanged, err := ScanSystem(c, m)
	if err != nil {
		t.Fatal(err)
	}
	if !hasChanged {
		t.Fatal("ScanSystem didn't return that it has changed")
	}
}

func TestScanSystemBootConfigDiffers(t *testing.T) {
	m := mocks.NewSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return([]byte{1, 2, 3}, nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("SetBootConfig", mustReadFile("osfiles/boot/config.txt")).Return(nil)
	c := &config.Config{}
	c.ClientId = "1234"
	hasChanged, err := ScanSystem(c, m)
	if err != nil {
		t.Fatal(err)
	}
	if !hasChanged {
		t.Fatal("ScanSystem didn't return that it has changed")
	}
}

func TestScanSystemCMDLineDiffers(t *testing.T) {
	m := mocks.NewSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return([]byte{}, nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("SetCMDLine", []byte(strings.Join(cmdLineCommands, " "))).Return(nil)
	c := &config.Config{}
	c.ClientId = "1234"
	hasChanged, err := ScanSystem(c, m)
	if err != nil {
		t.Fatal(err)
	}
	if !hasChanged {
		t.Fatal("ScanSystem didn't return that it has changed")
	}
}

func TestScanSystemLogindDiffers(t *testing.T) {
	m := mocks.NewSystemManager(t)
	m.On("GetHostname").Return("1234", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return(mustReadFile("osfiles/boot/config.txt"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return([]byte("test"), nil)
	m.On("SetLogindConf", mustReadFile("osfiles/etc/systemd/logind.conf")).Return(nil)
	c := &config.Config{}
	c.ClientId = "1234"
	hasChanged, err := ScanSystem(c, m)
	if err != nil {
		t.Fatal(err)
	}
	if !hasChanged {
		t.Fatal("ScanSystem didn't return that it has changed")
	}
}

func TestScanSystemMultipleChanged(t *testing.T) {
	m := mocks.NewSystemManager(t)
	m.On("GetHostname").Return("aa", nil)
	m.On("GetRCLocal").Return(mustReadFile("osfiles/etc/rc.local"), nil)
	m.On("GetBootConfig").Return([]byte("test"), nil)
	m.On("GetCMDLine").Return(mustReadFile("osfiles/boot/cmdline.txt"), nil)
	m.On("GetLogindConf").Return(mustReadFile("osfiles/etc/systemd/logind.conf"), nil)
	m.On("SetHostname", "1234").Return(nil)
	m.On("SetBootConfig", mustReadFile("osfiles/boot/config.txt")).Return(nil)
	c := &config.Config{}
	c.ClientId = "1234"
	hasChanged, err := ScanSystem(c, m)
	if err != nil {
		t.Fatal(err)
	}
	if !hasChanged {
		t.Fatal("ScanSystem didn't return that it has changed")
	}
}
