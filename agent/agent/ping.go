package agent

import (
	"context"
	"log"
	"time"

	"github.com/exactlylabs/radar/agent/internal/info"
)

func startPingLoop(ctx context.Context, respCh chan<- *PingResponse, pinger Pinger, pingFreq time.Duration, cliId, secret string) {
	pingTimer := time.NewTicker(pingFreq)
	buildInfo := info.BuildInfo()
	for {
		select {
		case <-ctx.Done():
			return
		case <-pingTimer.C:
			log.Println("Pinging server...")
			resp, err := pinger.Ping(buildInfo.Build, buildInfo.Version, cliId, secret)
			if err != nil {
				log.Println(err)
				continue
			}
			respCh <- resp
		}
	}
}
