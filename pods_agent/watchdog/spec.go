package watchdog

import (
	"context"
	"time"

	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
)

type MessageType int

const (
	UpdateWatchdogMessageType MessageType = iota
	EnableTailscaleMessageType
	DisableTailscaleMessageType
)

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
	// GetWatchdogServiceFile retrieves the contents of podwatchdog@.service file
	GetWatchdogServiceFile() ([]byte, error)
	// SetWatchdogServiceFile replaces the contents of podwatchdog@.service file
	SetWatchdogServiceFile([]byte) error
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
	// GetAuthFile returns a log of authentications in the system
	GetAuthLogFile() ([]byte, error)
	// GetSysTimezone
	GetSysTimezone() (*time.Location, error)
	// ResetLocaltime removes the timezone configuration
	SetSysTimezone(*time.Location) error
	// EnsureTailscale should make sure that tailscale is installed
	EnsureTailscale() error
	// TailscaleUp will log in to a tailnet using the provided authKey and tags
	TailscaleUp(authKey string, tags []string) error
	// TailscaleDown will log out of the current tailnet.
	TailscaleDown() error
	// TailscaleConnected returns if the pod is connected to a tailnet
	TailscaleConnected() (bool, error)
}

type UpdateBinaryServerMessage struct {
	Version   string `json:"version"`
	BinaryUrl string `json:"binary_url"`
}

type EnableTailscaleServerMessage struct {
	KeyId   string   `json:"key_id"`
	AuthKey string   `json:"auth_key"`
	Tags    []string `json:"tags"`
}

type DisableTailscaleServerMessage struct {
	KeyId string `json:"key_id"`
}

type ServerMessage struct {
	Type MessageType
	Data any
}

type WatchdogClient interface {
	Connect(context.Context, chan<- ServerMessage) error
	WatchdogPing(meta *sysinfo.ClientMeta) (*ServerMessage, error)
	NotifyTailscaleConnected(key_id string)
	NotifyTailscaleDisconnected(key_id string)
	Connected() bool
	Close() error
}
