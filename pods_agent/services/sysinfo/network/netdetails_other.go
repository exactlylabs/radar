//go:build !linux

package network

import (
	"net"
)

func getNetworkDetails(n NetInterface) *NetInterfaceDetail {
	status := networkInternetStatus(n.iface)
	netType := Unknown
	if n.iface.Flags&net.FlagLoopback != 0 {
		netType = Loopback
	}
	return &NetInterfaceDetail{
		Type:    netType,
		Status:  status,
		Enabled: n.iface.Flags&net.FlagUp != 0,
	}
}
