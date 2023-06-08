package ookla

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"

	"github.com/exactlylabs/radar/pods_agent/agent"
)

const DefaultMaxRetries int = 3

type Value struct {
	Bandwidth int64 `json:"bandwidth"`
	Bytes     int64 `json:"bytes"`
	Elapsed   int64 `json:"elapsed"`
}

type testResult struct {
	Download Value `json:"download"`
	Upload   Value `json:"upload"`
}

type ooklaRunner struct {
	MaxRetries int
}

// New ookla speedtest runner
func New() agent.Runner {
	return &ooklaRunner{
		MaxRetries: DefaultMaxRetries,
	}
}

func (r *ooklaRunner) Type() string {
	return "OOKLA"
}

func (r *ooklaRunner) run(ctx context.Context) (*agent.Measurement, error) {
	cmd := exec.CommandContext(ctx, binaryPath(), "--accept-license", "--accept-gdpr", "--format", "json")
	res, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("ookla.ooklaRunner#Run error executing the binary: %w", err)
	}
	// parsing the result's expected schema
	result := &testResult{}
	if err := json.Unmarshal(res, result); err != nil {
		return nil, fmt.Errorf("ookla.ooklaRunner#Run Unmarshal: %w", err)
	}
	return &agent.Measurement{
		Raw:          res,
		DownloadMbps: 8 * (float64(result.Download.Bandwidth) / (1000.0 * 1000.0)),
		UploadMbps:   8 * (float64(result.Upload.Bandwidth) / (1000.0 * 1000.0)),
	}, nil
}

func (r *ooklaRunner) Run(ctx context.Context) (res *agent.Measurement, err error) {
	log.Println("Ookla - Starting Speed Test")
	for i := 0; i < r.MaxRetries; i++ {
		log.Printf("Ookla - Attempt %d of %d", i+1, r.MaxRetries)
		res, err = r.run(ctx)
		if err == nil {
			log.Println("Ookla - Finished Speed Test")
			return
		}
		log.Printf("Ookla - Error running speed test: %v\n", err)
	}
	return nil, err
}
