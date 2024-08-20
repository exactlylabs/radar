package messages

import (
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"
)

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
