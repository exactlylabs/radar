package agent

import (
	"fmt"
	"log"
	"net"
	"os/exec"
	"path/filepath"

	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/internal/info"
)

func Metadata() *ClientMeta {
	buildInfo := info.BuildInfo()
	return &ClientMeta{
		Distribution:      buildInfo.Distribution,
		Version:           buildInfo.Version,
		NetInterfaces:     macAddresses(),
		WatchdogVersion:   getWatchdogVersion(),
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

func getWatchdogVersion() string {
	// we imply that watchdog is installed at /opt/radar/watchdog
	out, err := exec.Command(filepath.Join("/opt", "radar", "watchdog"), "-v").Output()
	if err != nil {
		log.Println("watchdog not found.")
		return ""
	}
	return string(out)
}
