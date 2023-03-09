package ndt7speedtest

import (
	"context"
	_ "embed"

	"github.com/exactlylabs/radar/pods_agent/agent"
)

//go:embed mock/ndt7result.json
var mockResult []byte

type Ndt7MockRunner struct {
	Err error
}

func NewMockedRunner() *Ndt7MockRunner {
	return &Ndt7MockRunner{}
}

func (r *Ndt7MockRunner) Type() string {
	return "NDT7"
}

func (r *Ndt7MockRunner) Run(ctx context.Context) (*agent.Measurement, error) {
	if r.Err != nil {
		return nil, r.Err
	}

	return &agent.Measurement{
		Raw:          mockResult,
		DownloadMbps: 436.32386704791077,
		UploadMbps:   47.88207222563206,
	}, nil
}
