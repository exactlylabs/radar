package watchdog

import (
	"context"
	"os"
	"time"

	"github.com/exactlylabs/radar/pods_agent/services/radar/messages"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"
)

type MessageType int

const (
	UpdateWatchdogMessageType MessageType = iota
	EnableTailscaleMessageType
	DisableTailscaleMessageType
	ConnectToSSIDMessageType
	ConnectToExistingSSIDMessageType
	ScanAPsMessageType
	ReportWirelessStatusMessageType
	SetWlanInterfaceMessageType
	DisconnectWirelessNetworkMessageType
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
	Interfaces() (network.NetInterfaces, error)
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
	// EnsureBinaryPermissions validates that the binary has "execute" permission for all users
	EnsureBinaryPermissions(path string) error
	// EnsureUserGroups will make sure that the user is part of the provided groups
	// In case of a change to the user, it will return true.
	EnsureUserGroups(user string, groups []string) (bool, error)
	// EnsurePathPermissions will make sure that the provided path has the provided permissions
	EnsurePathPermissions(path string, mode os.FileMode) error
	// EnsureWifiEnabled will make sure that the wifi driver is correctly configured and running
	EnsureWifiEnabled() error
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

type ConnectToSSIDMessage struct {
	SSID string `json:"ssid"`
	PSK  string `json:"psk"`
}

type ConnectToExistingSSIDMessage struct {
	SSID string `json:"ssid"`
}

type ScanAPsMessage struct{}

type ReportWirelessStatusMessage struct{}

type SetWlanInterfaceMessage struct {
	Name string `json:"interface"`
}

type DisconnectWirelessNetworkMessage struct{}

type ServerMessage struct {
	Type MessageType
	Data any
}

type GetSyncMessageFunc func() messages.WatchdogSync

type WatchdogClient interface {
	Connect(context.Context, chan<- ServerMessage, GetSyncMessageFunc) error
	WatchdogPing(meta *sysinfo.ClientMeta) (*ServerMessage, error)
	NotifyTailscaleConnected(key_id string)
	NotifyTailscaleDisconnected(key_id string)
	ReportScanAPsResult(aps []wifi.APDetails)
	ReportWirelessStatus(status wifi.WifiStatus)
	ReportWirelessConnectionStateChanged(state, ssid string)
	ReportActionError(action MessageType, err error)
	Connected() bool
	Close() error
}
