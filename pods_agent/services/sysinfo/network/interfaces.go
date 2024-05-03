package network

import (
	"fmt"
	"net"
	"slices"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/netroute"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"
)

func Interfaces() (NetInterfaces, error) {
	defaultRoute, err := netroute.DefaultRoute()
	if err != nil {
		return nil, errors.W(err)
	}

	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, errors.W(err)
	}
	wlanInterfaces, err := wifi.WlanInterfaceNames()
	if err != nil && !errors.Is(err, wifi.ErrNotSupported) {
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

		if iface.Flags&net.FlagLoopback == 0 {
			interfaces = append(interfaces, NetInterface{
				Name:         iface.Name,
				MAC:          iface.HardwareAddr.String(),
				DefaultRoute: gatewayRoute,
				IPs:          addrs,
				IsWlan:       slices.Contains(wlanInterfaces, iface.Name),
			})
		}
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
