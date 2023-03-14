//go:build !windows

package service

import (
	"github.com/kardianos/service"
)

func Setup() {
	// NOOP
}

func setupInstall() {
	// NOOP
}

func getConfig() *service.Config {
	conf := &service.Config{
		Name:        "radar-agent",
		DisplayName: "Radar Agent",
		Description: "Daemon service responsible for running speedtests",
	}
	return conf
}
