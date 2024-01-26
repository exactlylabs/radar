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

type NetInterfaces []NetInterface
