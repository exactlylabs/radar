package messages

import "github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"

// WirelessStatusReport has information of the currently connected wireless network
type WirelessStatusReport struct {
	Status wifi.WifiStatus `json:"status"`
}

// WirelessStateChangedReport holds the information on a state transition in the connection
type WirelessStateChangedReport struct {
	State string `json:"state"`
	SSID  string `json:"ssid"`
}

// AccessPointsFound has all detected Access Points from a Scan
type AccessPointsFound struct {
	APs []wifi.APDetails `json:"aps"`
}

type ErrorReport struct {
	Action    string `json:"action"`
	Error     string `json:"error"`
	ErrorType string `json:"error_type"`
}
