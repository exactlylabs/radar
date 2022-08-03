package watchdog

import "github.com/exactlylabs/radar/agent/services/sysinfo"

// SystemManager interface provides methods for dealing with some
// files of the POD Os
type SystemManager interface {
	// GetHostname of the system
	GetHostname() (string, error)
	// SetHostname of the system
	SetHostname(string) error
	// GetRCLocal retrieves the contents of rc.local file
	GetRCLocal() ([]byte, error)
	// SetRCLocal replaces the contents of rc.local file
	SetRCLocal([]byte) error
	// GetLogindConf retrieves the contents of logind.conf file
	GetLogindConf() ([]byte, error)
	// SetLogindConf replaces the contents of logind.conf file
	SetLogindConf([]byte) error
	// GetBootConfig retrieves the contents of config file from boot partition
	GetBootConfig() ([]byte, error)
	// SetBootConfig replaces the contents of config file from boot partition
	SetBootConfig([]byte) error
	// GetCMDLine retrieves the contents of cmdline.txt file
	GetCMDLine() ([]byte, error)
	// SetCMDLine replaces the contents of cmdline.txt file
	SetCMDLine([]byte) error
	// Interfaces will return all available interfaces of the current POD
	Interfaces() ([]sysinfo.NetInterface, error)
	// Reboot makes the system reboot
	Reboot() error
}

type BinaryUpdate struct {
	Version   string
	BinaryUrl string
}

type PingResponse struct {
	Update *BinaryUpdate
}
type WatchdogPinger interface {
	WatchdogPing(clientId, secret string, meta *sysinfo.ClientMeta) (*PingResponse, error)
}
