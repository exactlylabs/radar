package dev

import (
	"log"
	"time"

	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/watchdog"
)

type devSysManager struct {
	BootConfig  []byte
	CMDConfig   []byte
	Hostname    string
	LogindConf  []byte
	RCLocal     []byte
	Interfaces_ []sysinfo.NetInterface
	AuthLogFile []byte
	Tz          *time.Location
}

func NewDevSysManager() watchdog.SystemManager {
	utc, _ := time.LoadLocation("utc")
	return &devSysManager{Tz: utc}
}

// GetBootConfig implements watchdog.SystemManager
func (dm *devSysManager) GetBootConfig() ([]byte, error) {
	return dm.BootConfig, nil
}

// GetCMDLine implements watchdog.SystemManager
func (dm *devSysManager) GetCMDLine() ([]byte, error) {
	return dm.CMDConfig, nil
}

// GetHostname implements watchdog.SystemManager
func (dm *devSysManager) GetHostname() (string, error) {
	return dm.Hostname, nil
}

// GetLogindConf implements watchdog.SystemManager
func (dm *devSysManager) GetLogindConf() ([]byte, error) {
	return dm.LogindConf, nil
}

// GetRCLocal implements watchdog.SystemManager
func (dm *devSysManager) GetRCLocal() ([]byte, error) {
	return dm.RCLocal, nil
}

// Reboot implements watchdog.SystemManager
func (*devSysManager) Reboot() error {
	log.Println("Reboot Called!")
	return nil
}

// SetBootConfig implements watchdog.SystemManager
func (dm *devSysManager) SetBootConfig(data []byte) error {
	dm.BootConfig = data
	return nil
}

// SetCMDLine implements watchdog.SystemManager
func (dm *devSysManager) SetCMDLine(data []byte) error {
	dm.CMDConfig = data
	return nil
}

// SetHostname implements watchdog.SystemManager
func (dm *devSysManager) SetHostname(data string) error {
	dm.Hostname = data
	return nil
}

// SetLogindConf implements watchdog.SystemManager
func (dm *devSysManager) SetLogindConf(data []byte) error {
	dm.LogindConf = data
	return nil
}

// SetRCLocal implements watchdog.SystemManager
func (dm *devSysManager) SetRCLocal(data []byte) error {
	dm.RCLocal = data
	return nil
}

func (dm *devSysManager) Interfaces() ([]sysinfo.NetInterface, error) {
	return dm.Interfaces_, nil
}

func (dm *devSysManager) GetAuthLogFile() ([]byte, error) {
	return dm.AuthLogFile, nil
}

func (dm *devSysManager) GetSysTimezone() (*time.Location, error) {
	return dm.Tz, nil
}

func (dm *devSysManager) SetSysTimezone(tz *time.Location) error {
	dm.Tz = tz
	return nil
}
