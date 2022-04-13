package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/exactlylabs/radar/agent/agent"
	"github.com/exactlylabs/radar/agent/config"
	ndt7speedtest "github.com/exactlylabs/radar/agent/services/ndt7"
	"github.com/exactlylabs/radar/agent/services/ookla"
	"github.com/exactlylabs/radar/agent/services/radar"
)

var runners = []agent.Runner{
	ndt7speedtest.New(),
	ookla.New(),
}

func main() {
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT)
	ctx, cancel := context.WithCancel(context.Background())
	go func() {
		<-sigs
		log.Println("Received Interrupt signal. Stopping all contexts...")
		cancel()
	}()
	log.Println("Starting Pod...")
	c := config.LoadConfig()

	// RadarClient implements all three required interfaces
	cli := radar.NewClient(c.ServerURL)

	// Initiate the agent, passing the requested interfaces and runners
	agent := agent.NewAgent(cli, cli, cli, runners)
	agent.Start(ctx, c)
	log.Println("Bye :)")
}
