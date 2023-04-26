package sysinfo

import (
	"fmt"
	"net"

	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/info"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/netroute"
	"github.com/exactlylabs/radar/pods_agent/services/tracing"
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
		tracing.NotifyErrorOnce(fmt.Errorf("sysinfo.macAddresses DefaultRoute: %w", err), tracing.Context{})
	}
	ifaces, err := net.Interfaces()
	if err != nil {
		tracing.NotifyErrorOnce(fmt.Errorf("sysinfo.macAddresses DefaultRoute: %w", err), tracing.Context{})
		return nil
	}
	addresses := make([]NetInterfaces, 0)
	for _, iface := range ifaces {
		gatewayRoute := false
		if defaultRoute.Interface != nil && iface.Name == defaultRoute.Interface.Name {
			gatewayRoute = true
		}
		if iface.Flags&net.FlagLoopback == 0 {
			addresses = append(addresses, NetInterfaces{Name: iface.Name, MAC: iface.HardwareAddr.String(), DefaultRoute: gatewayRoute})
		}
	}
	return addresses
}
