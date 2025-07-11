package agent

import (
	"context"
	"log"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
)

func startPingLoop(ctx context.Context, respCh chan<- *ServerMessage, client RadarClient, pingFreq time.Duration) {
	pingTimer := time.NewTicker(pingFreq)

	meta := sysinfo.Metadata()

	for {
		select {
		case <-ctx.Done():
			return
		case <-pingTimer.C:
			if !client.Connected() {
				log.Println("Pinging server...")
				msgs, err := client.Ping(meta)
				if err != nil {
					log.Println(errors.W(err))
					continue
				}
				for _, msg := range msgs {
					respCh <- &msg
				}
			}
		}
	}
}
