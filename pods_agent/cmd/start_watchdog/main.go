package main

import (
	"context"
	_ "embed"
	"flag"
	"fmt"
	"log"
	"os"

	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/cmd/start_watchdog/internal/dev"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/info"
	"github.com/exactlylabs/radar/pods_agent/services/bufferedsentry"
	"github.com/exactlylabs/radar/pods_agent/services/radar"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/exactlylabs/radar/pods_agent/watchdog"
	"github.com/joho/godotenv"
)

var radarPath = flag.String("radar-path", "/opt/radar/radar_agent", "Path to radar binary")
var confPath = flag.String("conf-path", "/home/radar/.config/radar", "Path to find radar config.conf file")
var agentService = flag.String("agent-service", "radar_agent", "Name of the systemd service running the agent")
var version = flag.Bool("v", false, "Print the watchdog version")
var configFile = flag.String("c", "", "Path to the config.conf file to use. Defaults to the OS UserConfigDir/radar/config.conf")

func main() {
	flag.Parse()
	if *configFile != "" {
		config.SetConfigFilePath(*configFile)
	}
	if *version {
		fmt.Print(info.BuildInfo().Version)
		os.Exit(0)
	}
	godotenv.Load()
	if !info.IsDev() {
		// watchdog needs to run as root, so we should manually set the config path
		config.SetBasePath(*confPath)
	}
	c := config.LoadConfig()

	log.Println("Starting Radar POD Watchdog")
	bufferedsentry.Setup(c.SentryDsn, c.ClientId, info.BuildInfo().Version, c.Environment, "Pods Watchdog", os.TempDir())
	defer sentry.NotifyIfPanic()

	sysManager := sysinfo.NewSystemManager()
	cli := radar.NewWatchdogClient(c.ServerURL, c.ClientId, c.Secret)
	ctx := context.Background()
	if !info.IsDev() {
		agentCli := sysinfo.NewAgentInfoManager(*radarPath, *agentService)
		watchdog.Run(ctx, c, sysManager, agentCli, cli)
	} else {
		// We are in dev environment, use the dev interfaces
		fmt.Println("Running in Development Mode")
		agentCli := dev.NewDevAgentManager("Dev", true)
		sysManager := dev.NewDevSysManager()

		watchdog.Run(ctx, c, sysManager, agentCli, cli)
	}
}
