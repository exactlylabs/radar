package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/exactlylabs/radar/agent/agent"
	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/internal/info"
	ndt7speedtest "github.com/exactlylabs/radar/agent/services/ndt7"
	"github.com/exactlylabs/radar/agent/services/ookla"
	"github.com/exactlylabs/radar/agent/services/radar"
	"github.com/exactlylabs/radar/agent/services/tracing"
)

var runners = []agent.Runner{
	ndt7speedtest.New(),
	ookla.New(),
}

func main() {
	version := flag.Bool("v", false, "Show Agent Version")
	flag.Parse()

	if *version {
		fmt.Println(info.BuildInfo())
		os.Exit(0)
	}
	log.Println("Starting Radar Agent")
	log.Println(info.BuildInfo())
	c := config.LoadConfig()
	tracing.Setup(c, info.BuildInfo())
	defer tracing.NotifyPanic()

	sigs := make(chan os.Signal)
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
	cli := radar.NewClient(c.ServerURL)

	// Initiate the agent, passing the requested interfaces and runners
	agent := agent.NewAgent(cli, runners)
	agent.Start(ctx, c)
	log.Println("Bye :)")
}
