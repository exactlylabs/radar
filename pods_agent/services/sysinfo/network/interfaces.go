package network

import (
	"fmt"
	"net"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/netroute"
)

func Interfaces() (NetInterfaces, error) {
	defaultRoute, _ := netroute.DefaultRoute()

	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, errors.W(err)
	}

	interfaces := make(NetInterfaces, 0)
	for _, iface := range ifaces {
		gatewayRoute := false
		if defaultRoute.Interface != nil && iface.Name == defaultRoute.Interface.Name {
			gatewayRoute = true
		}
		addrs, err := iface.Addrs()
		if err != nil {
			return nil, errors.W(err).WithMetadata(errors.Metadata{"iface": fmt.Sprintf("%v", iface)})
		}

		interfaces = append(interfaces, NetInterface{
			iface:        iface,
			Name:         iface.Name,
			MAC:          iface.HardwareAddr.String(),
			DefaultRoute: gatewayRoute,
			IPs:          addrs,
		})
	}
	return interfaces, nil
}

// InterfaceIPByName returns the IP address of the first interface with a Unicast address
func InterfaceIPByName(name string) (*net.IPNet, error) {
	ifaces, err := Interfaces()
	if err != nil {
		return nil, errors.W(err)
	}
	found, iface := ifaces.FindByName(name)
	if !found {
		return nil, ErrInterfaceNotFound
	}
	ipAddr := iface.UnicastAddress()
	if ipAddr == nil {
		return nil, ErrInterfaceNotConnected
	}
	return ipAddr, nil
}
