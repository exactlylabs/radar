package agent

import (
	"context"
	"fmt"
	"log"
	"net"
	"strings"
	"time"

	"github.com/exactlylabs/radar/agent/internal/info"
)

func startPingLoop(ctx context.Context, respCh chan<- *PingResponse, pinger Pinger, pingFreq time.Duration, cliId, secret string) {
	pingTimer := time.NewTicker(pingFreq)
	buildInfo := info.BuildInfo()
	meta := &ClientMeta{
		Distribution:  buildInfo.Distribution,
		Version:       buildInfo.Version,
		NetInterfaces: macAddresses(),
	}

	for {
		select {
		case <-ctx.Done():
			return
		case <-pingTimer.C:
			log.Println("Pinging server...")
			resp, err := pinger.Ping(cliId, secret, meta)
			if err != nil {
				log.Println(err)
				continue
			}
			respCh <- resp
		}
	}
}

func macAddresses() string {
	ifaces, err := net.Interfaces()
	if err != nil {
		panic(fmt.Errorf("agent.macAddresses error: %w", err))
	}
	addresses := make([]string, 0)
	for _, iface := range ifaces {
		if iface.Flags&net.FlagLoopback == 0 {
			addresses = append(addresses, fmt.Sprintf("%s:%s", iface.Name, iface.HardwareAddr.String()))
		}
	}
	return strings.Join(addresses, ",")
}
