package sysinfo

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
)

const AgentPath = "/opt/radar/agent"
const AgentServicePath = "/etc/systemd/system/radar_agent.service"

type AgentInfoManager struct {
	binPath     string
	serviceName string
}

type NetInterfaces struct {
	Name string `json:"name"`
	MAC  string `json:"mac"`
	// DefaultRoute tells us if this is the default interface to connect to the internet
	DefaultRoute bool `json:"default_route"`
}

type ClientMeta struct {
	Version           string          `json:"version"`
	Distribution      string          `json:"distribution"`
	NetInterfaces     []NetInterfaces `json:"net_interfaces"`
	WatchdogVersion   string          `json:"watchdog_version"`
	RegistrationToken *string         `json:"registration_token"`
}

func (m *ClientMeta) String() string {
	return fmt.Sprintf(`Version: %v
Distribution: %v
NetInterfaces: %+v`,
		m.Version, m.Distribution, m.NetInterfaces)
}

func NewAgentInfoManager(binaryPath, serviceName string) *AgentInfoManager {
	return &AgentInfoManager{
		binPath:     binaryPath,
		serviceName: serviceName,
	}
}

// AgentMetadata should call the installed radar agent and get his version
func (am *AgentInfoManager) AgentMetadata() (*ClientMeta, error) {
	cmd := exec.Command(am.binPath, "-vv")
	metaBytes, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("pod.AgentMetadata Output: %w", err)
	}

	meta := &ClientMeta{}
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
	if exiterr, ok := err.(*exec.ExitError); ok && exiterr.ExitCode() == 3 && bytes.Contains(out, []byte("activating")) {
		// Systemctl is starting the service, so it's not running, but there's no error in the service configuration either
		return false, nil
	} else if err != nil {
		return false, fmt.Errorf("%v: %w", strings.TrimRight(string(out), "\n"), err)
	}
	if string(bytes.Trim(out, "\n")) != "active" {
		return false, fmt.Errorf("unexpected status: %v", string(out))
	}
	return true, nil
}
