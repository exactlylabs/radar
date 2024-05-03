package commands

import (
	"context"
	"log"

	"github.com/alexflint/go-arg"
	"github.com/exactlylabs/radar/pods_agent/agent"
	"github.com/exactlylabs/radar/pods_agent/cmd/start_agent/internal/runners"
	"github.com/exactlylabs/radar/pods_agent/cmd/start_agent/internal/service"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/info"
	"github.com/exactlylabs/radar/pods_agent/services/radar"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
)

type RunAgentCommand struct {
}

func (args RunAgentCommand) Validate(p *arg.Parser) {

}

func (args RunAgentCommand) Run(ctx context.Context, c *config.Config) {
	log.Println("Starting Radar Agent")
	log.Println(info.BuildInfo())

	ctx, cancel := context.WithCancel(ctx)
	service.Setup()

	cli := radar.NewClient(c.ServerURL, c.ClientId, c.Secret)

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
