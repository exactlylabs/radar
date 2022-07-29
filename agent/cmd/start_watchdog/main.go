package main

import (
	"context"
	_ "embed"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/exactlylabs/radar/agent/cmd/start_watchdog/internal/dev"
	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/internal/info"
	"github.com/exactlylabs/radar/agent/services/sysinfo"
	"github.com/exactlylabs/radar/agent/services/tracing"
	"github.com/exactlylabs/radar/agent/watchdog"
	"github.com/joho/godotenv"
)

var radarPath = flag.String("radar-path", "/opt/radar/radar_agent", "Path to radar binary")
var confPath = flag.String("conf-path", "/home/radar/.config/radar", "Path to find radar config.conf file")
var agentService = flag.String("agent-service", "radar_agent", "Name of the systemd service running the agent")
var version = flag.Bool("v", false, "Print the watchdog version")

func main() {
	flag.Parse()
	if *version {
		fmt.Print(info.BuildInfo().Version)
		os.Exit(0)
	}
	godotenv.Load()
	if strings.ToLower(os.Getenv("ENVIRONMENT")) != "dev" {
		// watchdog needs to run as root, so we should manually set the config path
		config.SetBasePath(*confPath)
	}
	c := config.LoadConfig()

	log.Println("Starting Radar POD Watchdog")
	tracing.Setup(c, info.BuildInfo())
	defer tracing.NotifyPanic()

	sysManager := sysinfo.NewSystemManager()
	config.SetBasePath(*confPath)
	ctx := context.Background()
	if strings.ToLower(os.Getenv("ENVIRONMENT")) != "dev" {
		agentCli := sysinfo.NewAgentInfoManager(*radarPath, *agentService)
		watchdog.Run(ctx, sysManager, agentCli)
	} else {
		// We are in dev environment, use the dev interfaces
		agentCli := dev.NewDevAgentManager()
		sysManager := dev.NewDevSysManager()
		watchdog.Run(ctx, sysManager, agentCli)
	}
}
