package sysinfo

import (
	"fmt"
	"net"

	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/internal/info"
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
	ifaces, err := net.Interfaces()
	if err != nil {
		panic(fmt.Errorf("agent.macAddresses error: %w", err))
	}
	addresses := make([]NetInterfaces, 0)
	for _, iface := range ifaces {
		if iface.Flags&net.FlagLoopback == 0 {
			addresses = append(addresses, NetInterfaces{Name: iface.Name, MAC: iface.HardwareAddr.String()})
		}
	}
	return addresses
}
