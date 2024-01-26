package messages

import (
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"
)

type Sync struct {
	Distribution      string                `json:"distribution"`
	Version           string                `json:"version"`
	NetInterfaces     network.NetInterfaces `json:"net_interfaces"`
	WatchdogVersion   string                `json:"watchdog_version"`
	RegistrationToken *string               `json:"registration_token"`
	OSVersion         string                `json:"os_version"`
	HardwarePlatform  string                `json:"hardware_platform"`
}

type WatchdogSync struct {
	Sync
	TailscaleConnected bool             `json:"tailscale_connected"`
	WlanInterface      string           `json:"wlan_interface"`
	WifiStatus         *wifi.WifiStatus `json:"wlan_status"`
}
