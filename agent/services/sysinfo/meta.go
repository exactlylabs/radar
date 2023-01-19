package sysinfo

import (
	"fmt"
	"net"

	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/internal/info"
	"github.com/exactlylabs/radar/agent/services/sysinfo/netroute"
)

func Metadata() *ClientMeta {
	buildInfo := info.BuildInfo()
	return &ClientMeta{
		Distribution:      buildInfo.Distribution,
		Version:           buildInfo.Version,
		NetInterfaces:     macAddresses(),
		WatchdogVersion:   GetWatchdogVersion(),
		RegistrationToken: config.LoadConfig().RegistrationToken,
	}
}

func macAddresses() []NetInterfaces {
	defaultRoute, err := netroute.DefaultRoute()
	if err != nil {
		panic(fmt.Errorf("sysinfo.macAddresses DefaultRoute: %w", err))
	}
	ifaces, err := net.Interfaces()
	if err != nil {
		panic(fmt.Errorf("sysinfo.macAddresses error: %w", err))
	}
	addresses := make([]NetInterfaces, 0)
	for _, iface := range ifaces {
		gatewayRoute := false
		if defaultRoute.Interface != nil && iface.Name == defaultRoute.Interface.Name {
			gatewayRoute = true
		}
		if iface.Flags&net.FlagLoopback == 0 {
			addresses = append(addresses, NetInterfaces{Name: iface.Name, MAC: iface.HardwareAddr.String(), GatewayRoute: gatewayRoute})
		}
	}
	return addresses
}
