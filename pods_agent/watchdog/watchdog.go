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

type Watchdog struct {
	c          *config.Config
	sysManager SystemManager
	agentCli   display.AgentClient
	cli        WatchdogClient
}

func NewWatchdog(c *config.Config, sysManager SystemManager, agentCli display.AgentClient, cli WatchdogClient) *Watchdog {
	return &Watchdog{
		c:          c,
		sysManager: sysManager,
		agentCli:   agentCli,
		cli:        cli,
	}
}

// Run is a blocking function that starts all routines related to the Watchdog.
func (w *Watchdog) Run(ctx context.Context) {
	go func() {
		defer sentry.NotifyIfPanic()
		display.StartDisplayLoop(ctx, os.Stdout, w.agentCli, w.sysManager)
	}()
	go func() {
		defer sentry.NotifyIfPanic()
		StartScanLoop(ctx, w.sysManager)
	}()

	timer := time.NewTicker(10 * time.Second)
	cliChan := make(chan ServerMessage)
	if err := w.cli.Connect(ctx, cliChan); err != nil {
		panic(err)
	}
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-cliChan:
			w.handleMessage(ctx, msg)

		case <-timer.C:
			if !w.cli.Connected() {
				res, err := w.cli.WatchdogPing(sysinfo.Metadata())
				if err != nil {
					log.Println(errors.W(err))
					continue
				} else if res != nil {
					w.handleMessage(ctx, *res)
				}
			}
		}
	}
}

func (w *Watchdog) handleMessage(ctx context.Context, msg ServerMessage) {
	switch msg.Type {
	case UpdateWatchdogMessageType:
		w.handleUpdate(msg.Data.(UpdateBinaryServerMessage))
	case EnableTailscaleMessageType:
		w.handleEnableTailscale(ctx, msg.Data.(EnableTailscaleServerMessage))
	case DisableTailscaleMessageType:
		w.handleDisableTailscale(ctx, msg.Data.(DisableTailscaleServerMessage))
	}
}

func (w *Watchdog) handleUpdate(data UpdateBinaryServerMessage) {
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
		if err := w.sysManager.Reboot(); err != nil {
			panic(err)
		}
		os.Exit(1)
	}
}

func (w *Watchdog) handleEnableTailscale(ctx context.Context, data EnableTailscaleServerMessage) {
	err := w.sysManager.TailscaleUp(data.AuthKey, data.Tags)
	if err != nil {
		errors.W(err).WithMetadata(errors.Metadata{
			"keyId": data.KeyId,
			"tags":  data.Tags,
		})
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
		return
	}
	log.Println("Successfully Logged in to Tailnet")
	w.cli.NotifyTailscaleConnected(data.KeyId)
}

func (w *Watchdog) handleDisableTailscale(ctx context.Context, data DisableTailscaleServerMessage) {
	err := w.sysManager.TailscaleDown()
	if err != nil {
		errors.W(err).WithMetadata(errors.Metadata{
			"keyId": data.KeyId,
		})
		sentry.NotifyErrorOnce(err, map[string]sentry.Context{})
		return
	}
	log.Println("Successfully Logged out of Tailnet")
	w.cli.NotifyTailscaleDisconnected(data.KeyId)
}
