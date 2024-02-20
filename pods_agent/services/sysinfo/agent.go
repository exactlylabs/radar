package sysinfo

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os/exec"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
)

const AgentPath = "/opt/radar/agent"
const AgentServicePath = "/etc/systemd/system/radar_agent.service"

type AgentInfoManager struct {
	binPath     string
	serviceName string
}

// ClientBasicMeta has binary-related information only
type ClientBasicMeta struct {
	Version           string  `json:"version"`
	Distribution      string  `json:"distribution"`
	WatchdogVersion   string  `json:"watchdog_version"`
	RegistrationToken *string `json:"registration_token"`
}

type ClientMeta struct {
	Version           string                `json:"version"`
	Distribution      string                `json:"distribution"`
	NetInterfaces     network.NetInterfaces `json:"net_interfaces"`
	WatchdogVersion   string                `json:"watchdog_version"`
	RegistrationToken *string               `json:"registration_token"`
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
func (am *AgentInfoManager) AgentMetadata() (*ClientBasicMeta, error) {
	cmd := exec.Command(am.binPath, "-vv")
	stderr := new(bytes.Buffer)
	cmd.Stderr = stderr
	metaBytes, err := cmd.Output()
	if err != nil {
		return nil, errors.Wrap(err, "error executing the binary").WithMetadata(
			errors.Metadata{
				"output": string(metaBytes),
				"stderr": stderr.String(),
				"binary": am.binPath,
			})
	}

	meta := &ClientBasicMeta{}
	if err := json.Unmarshal(metaBytes, meta); err != nil {
		return nil, errors.Wrap(err, "error unmarshalling the binary output").WithMetadata(errors.Metadata{
			"output": string(metaBytes),
			"stderr": stderr.String(),
			"binary": []string{am.binPath, "-vv"},
		})
	}
	return meta, nil
}

func (am *AgentInfoManager) GetVersion() (string, error) {
	meta, err := am.AgentMetadata()
	if err != nil {
		return "", errors.W(err)
	}
	return meta.Version, nil
}

func (am *AgentInfoManager) IsRunning() (bool, error) {
	// Check from systemd
	cmd := exec.Command("systemctl", "check", am.serviceName)
	stderr := new(bytes.Buffer)
	cmd.Stderr = stderr
	out, err := cmd.Output()
	if exiterr, ok := err.(*exec.ExitError); ok && exiterr.ExitCode() == 3 && bytes.Contains(out, []byte("activating")) {
		// Systemctl is starting the service, so it's not running, but there's no error in the service configuration either
		return false, nil
	} else if err != nil {
		return false, errors.Wrap(err, "error checking service status").WithMetadata(errors.Metadata{
			"output": string(out),
			"stderr": stderr.String(),
			"binary": []string{"systemctl", "check", am.serviceName},
		})
	}
	if string(bytes.Trim(out, "\n")) != "active" {
		return false, errors.New("unexpected status: %v", string(out))
	}
	return true, nil
}
