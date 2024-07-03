package network

import (
	"net"
)

type NetType string

const (
	Virtual  NetType = "virtual"
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
	Name         string     `json:"name"`
	MAC          string     `json:"mac"`
	IPs          []net.Addr `json:"ips"`
	DefaultRoute bool       `json:"default"`
	Type         NetType    `json:"type"`
	IsWlan       bool       `json:"is_wlan"` // To deprecate. Use Type instead
	Status       NetStatus  `json:"status"`
	Enabled      bool       `json:"enabled"`
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

type NetInterfaces []NetInterface

func (n NetInterfaces) FindByName(name string) (bool, NetInterface) {
	for _, iface := range n {
		if iface.Name == name {
			return true, iface
		}
	}
	return false, NetInterface{}
}
