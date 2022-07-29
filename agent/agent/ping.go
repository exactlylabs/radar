package agent

import (
	"context"
	"log"
	"time"
)

func startPingLoop(ctx context.Context, respCh chan<- *PingResponse, pinger Pinger, pingFreq time.Duration, cliId, secret string) {
	pingTimer := time.NewTicker(pingFreq)

	meta := Metadata()

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
