package watchdog

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/update"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/services/tracing"
	"github.com/exactlylabs/radar/pods_agent/watchdog/display"
)

// Run is a blocking function that starts all routines related to the Watchdog.
func Run(ctx context.Context, c *config.Config, sysManager SystemManager, agentCli display.AgentClient, cli WatchdogClient) {
	go func() {
		defer tracing.NotifyPanic()
		display.StartDisplayLoop(ctx, os.Stdout, agentCli, sysManager)
	}()
	go func() {
		defer tracing.NotifyPanic()
		StartScanLoop(ctx, sysManager)
	}()
	timer := time.NewTicker(10 * time.Second)
	cliChan := make(chan ServerMessage)
	if err := cli.Connect(ctx, cliChan); err != nil {
		panic(err)
	}
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-cliChan:
			if msg.Update != nil {
				handleUpdate(c, sysManager, *msg.Update)
			}
		case <-timer.C:
			if !cli.Connected() {
				res, err := cli.WatchdogPing(sysinfo.Metadata())
				if err != nil {
					log.Println(fmt.Errorf("watchdog.checkUpdate Ping: %w", err))
					return
				}
				if res.Update != nil {
					handleUpdate(c, sysManager, *res.Update)
				}
			}
		}
	}
}

func handleUpdate(c *config.Config, sysManager SystemManager, data BinaryUpdate) {
	log.Printf("An Update for Watchdog Version %v is available\n", data.Version)
	err := UpdateWatchdog(data.BinaryUrl)
	if err != nil && (errors.Is(err, update.ErrInvalidCertificate) ||
		errors.Is(err, update.ErrInvalidSignature) ||
		errors.Is(err, update.ErrCRLInvalidSignature) ||
		errors.Is(err, update.ErrCRLNotFound)) {
		log.Printf("Existent update is invalid: %v\n", err)
		tracing.NotifyErrorOnce(err, tracing.Context{
			"Update Data": {
				"version": data.Version,
				"url":     data.BinaryUrl,
			},
		})
	} else if errors.Is(err, update.ErrCRLExpired) {
		log.Println(err)
		// Notify ourselves to renew the CRL
		tracing.NotifyErrorOnce(err, tracing.Context{})
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
