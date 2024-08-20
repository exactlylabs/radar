package watchdog

import (
	"os"
	"time"

	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"
)

type MessageType int

const (
	UpdateWatchdogMessageType MessageType = iota
	EnableTailscaleMessageType
	DisableTailscaleMessageType
	ConfigureSSIDMessageType
	ForgetSSIDMessageType
	ScanAPsMessageType
	ReportConnectionStatusMessageType
	HealthCheckMessageType
	ReportLogsMessageType
	SyncMessageType
)

type SystemEventType int

const (
	SystemFileChanged SystemEventType = iota
	AgentStatusChanged
	EthernetStatusChanged
	LoginDetected
)

type SystemEvent struct {
	EventType SystemEventType
	Data      any
}

type SystemStatus struct {
	EthernetStatus  network.NetStatus
	PodAgentRunning bool
}

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
	// GetRadarAgentFile retrieves the contents of radar_agent.service file
	GetRadarAgentServiceFile() ([]byte, error)
	// SetRadarAgentFile replaces the contents of radar_agent.service file
	SetRadarAgentServiceFile([]byte) error
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
	// GetAuthFile returns logs from systemd-logind
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
	// EthernetStatus returns the current status of the Ethernet connection in the OS
	EthernetStatus() (network.NetStatus, error)
	// PodAgentRunning returns if the agent is in a running state
	PodAgentRunning() (bool, error)
	// SetACTLED will set the state of the ACT LED
	SetACTLED(state bool) error
	// GetServiceLogs will collect the logs of the given service name, and return the last given amount of lines.
	GetServiceLogs(name string, lines int) (string, error)
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

type ConfigureSSIDMessage struct {
	SSID     string  `json:"ssid"`
	Password *string `json:"password"`
	Identity string  `json:"identity"`
	Security string  `json:"security"`
	Hidden   bool    `json:"hidden"`
	Enabled  bool    `json:"enabled"`
}

type ForgetSSIDMessage struct {
	SSID string `json:"ssid"`
}

type ScanAPsMessage struct{}

type ReportConnectionStatusMessage struct{}

type SyncMessage struct{}

type ServerMessage struct {
	Type MessageType
	Data any
}

type HealthCheckServerMessage struct{}

type ReportLogsMessage struct {
	Services []string `json:"services"`
	Lines    int      `json:"lines"`
}

// type GetSyncMessageFunc func() messages.WatchdogSync

type EthernetStatus struct {
	Status network.NetStatus `json:"status"`
}

type WlanStatus struct {
	Status         network.NetStatus `json:"status"`
	SSID           string            `json:"ssid"`
	SignalStrength int               `json:"signal_strength"`
	Frequency      int               `json:"frequency"`
	LinkSpeed      int               `json:"link_speed"`
	Channel        int               `json:"channel"`
}

type ConnectionsStatus struct {
	Wlan     WlanStatus     `json:"wlan"`
	Ethernet EthernetStatus `json:"ethernet"`
}

type WatchdogSync struct {
	Version            string            `json:"version"`
	TailscaleConnected bool              `json:"tailscale_connected"`
	ConnectionStatus   ConnectionsStatus `json:"connections_status"`
	RegisteredSSIDs    []string          `json:"registered_ssids"`
}

type Logs map[string]string

type WatchdogClient interface {
	Connect(chan<- ServerMessage) error
	WatchdogPing(meta *sysinfo.ClientMeta) (*ServerMessage, error)
	NotifyTailscaleConnected(key_id string)
	NotifyTailscaleDisconnected(key_id string)
	SyncData(data WatchdogSync) error
	ReportScanAPsResult(aps []wifi.APDetails)
	ReportConnectionStatus(status ConnectionsStatus)
	ReportWirelessConnectionStateChanged(state, ssid string)
	ReportLogs(l Logs)
	ReportActionError(action MessageType, err error)
	Connected() bool
	Close() error
}
