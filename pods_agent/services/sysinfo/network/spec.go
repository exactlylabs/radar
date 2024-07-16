package network

import (
	"net"
)

type NetType string

const (
	Unknown  NetType = "unknown"
	Virtual  NetType = "virtual"
	Loopback NetType = "loopback"
	Ethernet NetType = "ethernet"
	Wlan     NetType = "wlan"
)

type NetStatus string

const (
	ConnectedWithInternet NetStatus = "connected_with_internet"
	ConnectedNoInternet   NetStatus = "connected_no_internet"
	Disconnected          NetStatus = "disconnected"
)

type ConnectionError string

const (
	NoError       ConnectionError = ""
	WrongPassword ConnectionError = "wrong_password"
	SSIDNotFound  ConnectionError = "ssid_not_found"
	UnknownError  ConnectionError = "unknown_error"
)

type NetInterface struct {
	iface        net.Interface
	Name         string     `json:"name"`
	MAC          string     `json:"mac"`
	IPs          []net.Addr `json:"ips"`
	DefaultRoute bool       `json:"default"`
}

// NetInterfaceDetail holds more information on the NetInterface
// This is the kind of information that is dependant on the OS to be able to get.
type NetInterfaceDetail struct {
	Type    NetType   `json:"type"`
	IsWlan  bool      `json:"is_wlan"` // To deprecate. Use Type instead
	Status  NetStatus `json:"status"`
	Enabled bool      `json:"enabled"`
}

func (n NetInterface) UnicastAddress() *net.IPNet {
	for _, addr := range n.IPs {
		if ipAddr, ok := addr.(*net.IPNet); ok {
			if ipAddr.IP.IsGlobalUnicast() {
				return ipAddr
			}
		}
	}
	return nil
}

// Details return extra information from the Network Interface. Depending on the OS some information may be missing.
// This is an expensive operation as it does some HTTP calls, make sure to call it only when needed.
func (n NetInterface) Details() *NetInterfaceDetail {
	return getNetworkDetails(n)
}

type NetInterfaces []NetInterface

func (n NetInterfaces) FindByName(name string) (bool, NetInterface) {
	for _, iface := range n {
		if iface.Name == name {
			return true, iface
		}
	}
	return false, NetInterface{}
}

func (n NetInterfaces) FindByType(t NetType) *NetInterface {
	for _, iface := range n {
		if iface.Details().Type == t {
			return &iface
		}
	}
	return nil
}
