package commands

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/alexflint/go-arg"
	"github.com/exactlylabs/radar/pods_agent/agent"
	"github.com/exactlylabs/radar/pods_agent/cmd/start_agent/internal/runners"
	"github.com/exactlylabs/radar/pods_agent/cmd/start_agent/internal/service"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/services/radar"
	win_service "github.com/kardianos/service"
)

type ServiceCommand struct {
	Action string `arg:"positional,required" help:"Action to perform on the service. Valid actions: install, uninstall, start, stop, restart"`
}

func (args ServiceCommand) Validate(p *arg.Parser) {
	for _, action := range win_service.ControlAction {
		if action == args.Action {
			return
		}
	}
	p.FailSubcommand(fmt.Sprintf("Invalid action: %s", args.Action), "service")
}

func (args ServiceCommand) Run(ctx context.Context, c *config.Config) {
	service.Setup()
	ctx, cancel := context.WithCancel(ctx)

	cli := radar.NewClient(c.ServerURL, c.ClientId, c.Secret)
	agent := agent.NewAgent(cli, runners.GetRunners())
	s := service.MakeService(agent, c, ctx, cancel)

	err := win_service.Control(s, args.Action)
	if err != nil && err == win_service.ErrNotInstalled {
		os.Exit(0)
	} else if err != nil {
		log.Printf("Valid actions: %q\n", win_service.ControlAction)
		log.Fatal(err)
	} else if args.Action == "install" {
		service.SetupInstall()
	}

	os.Exit(0)

}
