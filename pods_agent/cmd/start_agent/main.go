package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/exactlylabs/radar/pods_agent/cmd/start_agent/internal/commands"
)

func main() {
	// version := flag.Bool("v", false, "Show Agent Version")
	// jsonVersion := flag.Bool("vv", false, "Show Agent Version in JSON format")
	// configFile := flag.String("c", "", "Path to the config.conf file to use. Defaults to the OS UserConfigDir/radar/config.conf")
	// forcedVersion := flag.String("set-version", "", "Set the version of the agent. Only works in Development mode.")

	// flag.Parse()
	// if *forcedVersion != "" && info.IsDev() {
	// 	info.SetVersion(*forcedVersion)
	// }
	// if *configFile != "" {
	// 	config.SetConfigFilePath(*configFile)
	// }
	// if *version {
	// 	fmt.Println(sysinfo.Metadata())
	// 	os.Exit(0)
	// }
	// if *jsonVersion {
	// 	jsonMeta, err := json.Marshal(sysinfo.Metadata())
	// 	if err != nil {
	// 		panic(err)
	// 	}
	// 	fmt.Println(string(jsonMeta))
	// 	os.Exit(0)
	// }
	// Setup this executable's Service (if running as one or a command was sent for it)
	// service.Setup()

	// log.Println("Starting Radar Agent")
	// log.Println(info.BuildInfo())

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

	commands.Run(ctx)
}
