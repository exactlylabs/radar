package netroute

import "net"

// Route is a network route, that stores the destination IP and through which interface the packages goes to
type Route struct {
	// Gateway IP that our default route goes to
	GatewayIp net.IP
	// Network Interface that we use to send packages to the gateway
	Interface *net.Interface
}
