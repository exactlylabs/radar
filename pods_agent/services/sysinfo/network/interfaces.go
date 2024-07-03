package network

import (
	"fmt"
	"net"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/netroute"
)

func Interfaces() (NetInterfaces, error) {
	defaultRoute, _ := netroute.DefaultRoute()
	// if err != nil {
	// 	return nil, errors.W(err)
	// }

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

		// Filter out virtual and loopback interfaces

		if iface.Flags&net.FlagLoopback == 0 {
			netType, err := networkType(iface)
			if err != nil {
				return nil, errors.W(err)
			}

			status, err := networkInternetStatus(iface)
			if err != nil {
				return nil, errors.W(err)
			}

			interfaces = append(interfaces, NetInterface{
				Name:         iface.Name,
				MAC:          iface.HardwareAddr.String(),
				DefaultRoute: gatewayRoute,
				IPs:          addrs,
				Type:         netType,
				IsWlan:       netType == Wlan,
				Status:       status,
				Enabled:      iface.Flags&net.FlagUp != 0,
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
