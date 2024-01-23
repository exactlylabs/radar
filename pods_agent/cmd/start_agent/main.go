package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/agent"
	"github.com/exactlylabs/radar/pods_agent/cmd/start_agent/internal/runners"
	"github.com/exactlylabs/radar/pods_agent/cmd/start_agent/internal/service"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/info"
	"github.com/exactlylabs/radar/pods_agent/services/bufferedsentry"
	"github.com/exactlylabs/radar/pods_agent/services/radar"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
)

func main() {
	version := flag.Bool("v", false, "Show Agent Version")
	jsonVersion := flag.Bool("vv", false, "Show Agent Version in JSON format")
	configFile := flag.String("c", "", "Path to the config.conf file to use. Defaults to the OS UserConfigDir/radar/config.conf")
	forcedVersion := flag.String("set-version", "", "Set the version of the agent. Only works in Development mode.")

	flag.Parse()
	if *forcedVersion != "" && info.IsDev() {
		info.SetVersion(*forcedVersion)
	}
	if *configFile != "" {
		config.SetConfigFilePath(*configFile)
	}
	if *version {
		fmt.Println(sysinfo.Metadata())
		os.Exit(0)
	}
	if *jsonVersion {
		jsonMeta, err := json.Marshal(sysinfo.Metadata())
		if err != nil {
			panic(err)
		}
		fmt.Println(string(jsonMeta))
		os.Exit(0)
	}
	// Setup this executable's Service (if running as one or a command was sent for it)
	service.Setup()

	log.Println("Starting Radar Agent")
	log.Println(info.BuildInfo())
	c := config.LoadConfig()
	bufferedsentry.Setup(c.SentryDsn, c.ClientId, info.BuildInfo().Version, c.Environment, "Pods Agent", os.TempDir())
	defer sentry.NotifyIfPanic()

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT)
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
				os.Exit(0)
			}
		}
	}()

	// RadarClient implements all three required interfaces
	cli := radar.NewClient(c.ServerURL, c.ClientId, c.Secret)

	// Initiate the agent, passing the requested interfaces and runners
	agent := agent.NewAgent(cli, runners.GetRunners())

	svc := service.MakeService(agent, c, ctx, cancel)
	sysManager := sysinfo.NewSystemManager()
	if service.Interactive() {
		agent.Start(ctx, c, sysManager)
		log.Println("Bye :)")
	} else {
		if svc != nil {
			err := svc.Run()
			if err != nil {
				panic(err)
			}
		}
	}

}
