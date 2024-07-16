package network

import (
	"net"
	"os"
	"path/filepath"
)

func networkType(iface net.Interface) NetType {
	if iface.Flags&net.FlagLoopback != 0 {
		return Loopback
	} else if _, err := os.Stat(filepath.Join("/sys/devices/virtual/net", iface.Name)); err == nil {
		return Virtual

	} else if f, err := os.Stat(filepath.Join("/sys/class/net", iface.Name, "wireless")); err == nil && f.IsDir() {
		return Wlan
	}

	return Ethernet
}

func getNetworkDetails(n NetInterface) *NetInterfaceDetail {
	status := networkInternetStatus(n.iface)
	netType := networkType(n.iface)
	return &NetInterfaceDetail{
		Type:    netType,
		IsWlan:  netType == Wlan,
		Status:  status,
		Enabled: n.iface.Flags&net.FlagUp != 0,
	}
}
