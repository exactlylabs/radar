package helpers

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
)

// InterruptSignalContext returns a context that is cancelled on SIGINT or SIGTERM; a
// second signal exits immediately.
func InterruptSignalContext() context.Context {
	sigs := make(chan os.Signal, 2)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	ctx, cancel := context.WithCancel(context.Background())
	interrupts := 0
	go func() {
		for range sigs {
			if interrupts == 0 {
				log.Println("Received Interrupt signal. Stopping all contexts...")
				log.Println("Send another signal in case you wish to force shutdown")
				cancel()
				interrupts++
			} else {
				log.Println("Forcing Shutdown")
				os.Exit(1)
			}
		}
	}()
	return ctx
}
