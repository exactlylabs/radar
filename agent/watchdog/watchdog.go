package watchdog

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/internal/update"
	"github.com/exactlylabs/radar/agent/services/sysinfo"
	"github.com/exactlylabs/radar/agent/services/tracing"
	"github.com/exactlylabs/radar/agent/watchdog/display"
)

// Run is a blocking function that starts all routines related to the Watchdog.
func Run(ctx context.Context, c *config.Config, sysManager SystemManager, agentCli display.AgentClient, pinger WatchdogPinger) {
	go display.StartDisplayLoop(ctx, os.Stdout, agentCli, sysManager)
	go StartScanLoop(ctx, sysManager)
	timer := time.NewTicker(10 * time.Second)
	for {
		select {
		case <-ctx.Done():
			return
		case <-timer.C:
			checkUpdate(c, sysManager, pinger)
		}
	}
}

func checkUpdate(c *config.Config, sysManager SystemManager, pinger WatchdogPinger) {
	res, err := pinger.WatchdogPing(c.ClientId, c.Secret, sysinfo.Metadata())
	if err != nil {
		log.Println(fmt.Errorf("watchdog.checkUpdate Ping: %w", err))
		return
	}
	if res.Update != nil {
		log.Printf("An Update for Watchdog Version %v is available\n", res.Update.Version)
		err = UpdateWatchdog(res.Update.BinaryUrl)
		if err != nil && (errors.Is(err, update.ErrInvalidCertificate) ||
			errors.Is(err, update.ErrInvalidSignature) ||
			errors.Is(err, update.ErrCRLInvalidSignature) ||
			errors.Is(err, update.ErrCRLNotFound)) {
			log.Printf("Existent update is invalid: %v\n", err)
			tracing.NotifyErrorOnce(err, map[string]interface{}{
				"Update Data": map[string]string{
					"version": res.Update.Version,
					"url":     res.Update.BinaryUrl,
				},
			})
		} else if errors.Is(err, update.ErrCRLExpired) {
			log.Println(err)
			// Notify ourselves to renew the CRL
			tracing.NotifyErrorOnce(err, map[string]interface{}{})
		} else if err != nil {
			panic(err)
		} else {
			log.Println("Successfully Updated the Watchdog. Restarting the whole system")
			if err := sysManager.Reboot(); err != nil {
				panic(fmt.Errorf("watchdog.checkUpdate Reboot: %w", err))
			}
			os.Exit(1)
		}
	}
}
