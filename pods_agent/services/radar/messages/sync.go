package messages

import "github.com/exactlylabs/radar/pods_agent/services/sysinfo"

type Sync struct {
	Distribution      string                  `json:"distribution"`
	Version           string                  `json:"version"`
	NetInterfaces     []sysinfo.NetInterfaces `json:"net_interfaces"`
	WatchdogVersion   string                  `json:"watchdog_version"`
	RegistrationToken *string                 `json:"registration_token"`
	OSVersion         string                  `json:"os_version"`
	HardwarePlatform  string                  `json:"hardware_platform"`
}
