package sysinfo

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"

	"github.com/exactlylabs/radar/agent/agent"
)

type AgentInfoManager struct {
	binPath     string
	serviceName string
}

func NewAgentInfoManager(binaryPath, serviceName string) *AgentInfoManager {
	return &AgentInfoManager{
		binPath:     binaryPath,
		serviceName: serviceName,
	}
}

// AgentMetadata should call the installed radar agent and get his version
func (am *AgentInfoManager) AgentMetadata() (*agent.ClientMeta, error) {
	cmd := exec.Command(am.binPath, "-vv")
	metaBytes, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("pod.AgentMetadata Output: %w", err)
	}

	meta := &agent.ClientMeta{}
	if err := json.Unmarshal(metaBytes, meta); err != nil {
		return nil, fmt.Errorf("pod.AgentMetadata Unmarshal: %w", err)
	}
	return meta, nil
}

func (am *AgentInfoManager) GetVersion() (string, error) {
	meta, err := am.AgentMetadata()
	if err != nil {
		return "", err
	}
	return meta.Version, nil
}

func (am *AgentInfoManager) IsRunning() (bool, error) {
	// Check from systemd
	out, err := exec.Command("systemctl", "check", am.serviceName).Output()
	if err != nil {
		return false, fmt.Errorf("%v: %w", strings.TrimRight(string(out), "\n"), err)
	}
	if string(out) != "active" {
		return false, fmt.Errorf("unexpected status: %v", string(out))
	}
	return true, nil
}
