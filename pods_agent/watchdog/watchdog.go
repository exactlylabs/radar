package watchdog

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/update"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/watchdog/display"
)

// Run is a blocking function that starts all routines related to the Watchdog.
func Run(ctx context.Context, c *config.Config, sysManager SystemManager, agentCli display.AgentClient, cli WatchdogClient) {
	go func() {
		defer sentry.NotifyIfPanic()
		display.StartDisplayLoop(ctx, os.Stdout, agentCli, sysManager)
	}()
	go func() {
		defer sentry.NotifyIfPanic()
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
					log.Println(errors.W(err))
				} else if res.Update != nil {
					handleUpdate(c, sysManager, *res.Update)
				}
			}
		}
	}
}

func handleUpdate(c *config.Config, sysManager SystemManager, data BinaryUpdate) {
	log.Printf("An Update for Watchdog Version %v is available\n", data.Version)
	err := UpdateWatchdog(data.BinaryUrl, data.Version)
	if update.IsValidationError(err) {
		log.Printf("Existent update is invalid: %v\n", err)
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{
			"Update Data": {
				"version": data.Version,
				"url":     data.BinaryUrl,
			},
		})
	} else if err != nil {
		panic(err)
	} else {
		log.Println("Successfully Updated the Watchdog. Restarting the whole system")
		if err := sysManager.Reboot(); err != nil {
			panic(err)
		}
		os.Exit(1)
	}
}
