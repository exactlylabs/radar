package ookla

import (
	"context"
	"fmt"
	"log"
	"os/exec"

	"github.com/exactlylabs/radar/agent/agent"
)

type ooklaRunner struct {
}

// New ookla speedtest runner
func New() agent.Runner {
	return &ooklaRunner{}
}

func (r *ooklaRunner) Type() string {
	return "OOKLA"
}

func (r *ooklaRunner) Run(ctx context.Context) ([]byte, error) {
	log.Println("Ookla - Starting Speed Test")
	cmd := exec.CommandContext(ctx, binaryPath, "--accept-license", "--accept-gdpr", "--format", "json")
	res, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("speedtest.ooklaRunner#Run error executing the binary: %w", err)
	}
	log.Println("Ookla - Finished Speed Test")
	return res, nil
}
