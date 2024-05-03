package service

import (
	"context"

	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/agent"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/kardianos/service"
)

var (
	Interactive = service.Interactive
)

func MakeService(agent *agent.Agent, c *config.Config, ctx context.Context, cancel context.CancelFunc) service.Service {
	svc := &agentSvc{agent, ctx, c, cancel}
	s, err := service.New(svc, getConfig())
	if err != nil {
		panic(err)
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
		defer sentry.NotifyIfPanic()
		sysManager := sysinfo.NewSystemManager()
		svc.agent.Start(svc.ctx, svc.c, sysManager)
	}()
	return nil
}

func (svc *agentSvc) Stop(s service.Service) error {
	svc.cancel()
	return nil
}
