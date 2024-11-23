package ookla

import (
	"context"
	_ "embed"
	"log"
	"time"

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

func (r *OoklaMockRunner) Setup() error {
	return nil
}

func (r *OoklaMockRunner) Type() string {
	return "OOKLA"
}

func (r *OoklaMockRunner) RunForInterface(ctx context.Context, name string) (*agent.Measurement, error) {
	log.Println("Running Mock Ookla Speedtest for Interface:", name)
	if r.Err != nil {
		return nil, r.Err
	}
	time.Sleep(10 * time.Second)

	return &agent.Measurement{
		Raw:          mockResult,
		DownloadMbps: 8 * (float64(50357709) / (1000.0 * 1000.0)),
		UploadMbps:   8 * (float64(5899553) / (1000.0 * 1000.0)),
	}, nil
}

func (r *OoklaMockRunner) Run(ctx context.Context) (*agent.Measurement, error) {
	return r.RunForInterface(ctx, "")
}
