package agent

import (
	"context"
	"fmt"
	"log"
	"time"
)

func startPingLoop(ctx context.Context, respCh chan<- *PingResponse, pinger Pinger, pingFreq time.Duration, cliId, secret string) {
	pingTimer := time.NewTicker(pingFreq)
	for {
		select {
		case <-ctx.Done():
			return
		case <-pingTimer.C:
			log.Println("Pinging server...")
			resp, err := pinger.Ping(cliId, secret)
			if err != nil {
				panic(fmt.Errorf("pod.StartLoop ping error: %w", err))
			}
			respCh <- resp
		}
	}
}
