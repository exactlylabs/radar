package network

import "net"

func networkType(iface net.Interface) (netType NetType, err error) {
	return Ethernet, nil
}
