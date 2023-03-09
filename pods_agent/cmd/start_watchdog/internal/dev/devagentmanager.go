package dev

import (
	"github.com/exactlylabs/radar/agent/watchdog/display"
)

type DevAgentManager struct {
	Version    string
	IsRunning_ bool
}

func NewDevAgentManager(version string, isRunning bool) display.AgentClient {
	return &DevAgentManager{version, isRunning}
}

// GetVersion implements display.AgentClient
func (dm *DevAgentManager) GetVersion() (string, error) {
	return dm.Version, nil
}

// IsRunning implements display.AgentClient
func (dm *DevAgentManager) IsRunning() (bool, error) {
	return dm.IsRunning_, nil
}
