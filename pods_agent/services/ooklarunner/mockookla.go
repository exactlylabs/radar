package ookla

import (
	"context"
	_ "embed"
	"log"

	"github.com/exactlylabs/radar/pods_agent/agent"
)

//go:embed mock/ooklaresult.json
var mockResult []byte

type OoklaMockRunner struct {
	Err error
}

func NewMockedRunner() *OoklaMockRunner {
	return &OoklaMockRunner{}
}

func (r *OoklaMockRunner) Type() string {
	return "OOKLA"
}

func (r *OoklaMockRunner) Run(ctx context.Context) (*agent.Measurement, error) {
	log.Println("Running Mock Ookla Speedtest")
	if r.Err != nil {
		return nil, r.Err
	}

	return &agent.Measurement{
		Raw:          mockResult,
		DownloadMbps: 8 * (float64(50357709) / (1000.0 * 1000.0)),
		UploadMbps:   8 * (float64(5899553) / (1000.0 * 1000.0)),
	}, nil
}
