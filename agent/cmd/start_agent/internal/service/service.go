package service

import (
	"context"
	"flag"
	"log"
	"os"

	"github.com/exactlylabs/radar/agent/agent"
	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/services/sysinfo"
	"github.com/exactlylabs/radar/agent/services/tracing"
	"github.com/kardianos/service"
)

var (
	Interactive = service.Interactive
)

var svcFlag = flag.String("service", "", "Control the system service.")

func MakeService(agent *agent.Agent, c *config.Config, ctx context.Context, cancel context.CancelFunc) service.Service {
	svc := &agentSvc{agent, ctx, c, cancel}
	s, err := service.New(svc, getConfig())
	if err != nil {
		panic(err)
	}
	if len(*svcFlag) != 0 {
		err := service.Control(s, *svcFlag)
		if err != nil && err == service.ErrNotInstalled {
			os.Exit(0)
		} else if err != nil {
			log.Printf("Valid actions: %q\n", service.ControlAction)
			log.Fatal(err)
		} else if *svcFlag == "install" {
			setupInstall()
		}
		os.Exit(0)
	}
	return s
}

type agentSvc struct {
	agent  *agent.Agent
	ctx    context.Context
	c      *config.Config
	cancel context.CancelFunc
}

func (svc *agentSvc) Start(s service.Service) error {
	go func() {
		defer tracing.NotifyPanic()
		sysManager := sysinfo.NewSystemManager()
		svc.agent.Start(svc.ctx, svc.c, sysManager)
	}()
	return nil
}

func (svc *agentSvc) Stop(s service.Service) error {
	svc.cancel()
	return nil
}
