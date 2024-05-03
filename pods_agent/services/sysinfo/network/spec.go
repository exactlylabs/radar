package network

import (
	"net"
)

type NetInterface struct {
	Name         string     `json:"name"`
	MAC          string     `json:"mac"`
	IPs          []net.Addr `json:"ips"`
	DefaultRoute bool       `json:"default"`
	IsWlan       bool       `json:"is_wlan"`
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
