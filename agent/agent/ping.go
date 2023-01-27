package agent

import (
	"context"
	"log"
	"time"

	"github.com/exactlylabs/radar/agent/services/sysinfo"
)

func startPingLoop(ctx context.Context, respCh chan<- *ServerMessage, pinger Pinger, pingFreq time.Duration, cliId, secret string) {
	pingTimer := time.NewTicker(pingFreq)

	meta := sysinfo.Metadata()

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
