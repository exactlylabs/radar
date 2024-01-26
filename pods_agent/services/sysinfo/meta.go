package sysinfo

import (
	"log"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
	"github.com/exactlylabs/radar/pods_agent/config"
	"github.com/exactlylabs/radar/pods_agent/internal/info"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/netroute"
)

func Metadata() *ClientMeta {
	buildInfo := info.BuildInfo()
	ifaces, err := network.Interfaces()
	if err != nil {
		log.Println(errors.W(err))
		if !errors.Is(err, netroute.ErrDefaultRouteNotFound) {
			sentry.NotifyErrorOnce(errors.W(err), map[string]sentry.Context{})
		}
	}
	return &ClientMeta{
		Distribution:      buildInfo.Distribution,
		Version:           buildInfo.Version,
		NetInterfaces:     ifaces,
		WatchdogVersion:   GetWatchdogVersion(),
		RegistrationToken: config.LoadConfig().RegistrationToken,
	}
}
