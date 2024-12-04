package ookla

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"os/exec"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/agent"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network"
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

func (r *ooklaRunner) Setup() error {
	err := createOoklaBinary()
	if err != nil {
		return errors.W(err)
	}
	return nil
}

func (r *ooklaRunner) Type() string {
	return "OOKLA"
}

func (r *ooklaRunner) run(ctx context.Context, name string) (*agent.Measurement, error) {
	cmd := exec.CommandContext(ctx, binaryPath(), "--accept-license", "--accept-gdpr", "--format", "json")
	if name != "" {
		addr, err := network.InterfaceIPByName(name)
		if err != nil {
			return nil, errors.W(err)
		}
		cmd = exec.CommandContext(ctx, binaryPath(), "--accept-license", "--accept-gdpr", "--format", "json", "--ip", addr.IP.String())
	}

	stderr := new(bytes.Buffer)
	cmd.Stderr = stderr
	res, err := cmd.Output()

	if err != nil {
		return nil, errors.Wrap(err, "error executing the binary").WithMetadata(
			errors.Metadata{
				"output": string(res),
				"stderr": stderr.String(),
			})
	}
	// parsing the result's expected schema
	result := &testResult{}
	if err := json.Unmarshal(res, result); err != nil {
		return nil, errors.Wrap(err, "Unmarshal failed")
	}
	return &agent.Measurement{
		Raw:          res,
		DownloadMbps: 8 * (float64(result.Download.Bandwidth) / (1000.0 * 1000.0)),
		UploadMbps:   8 * (float64(result.Upload.Bandwidth) / (1000.0 * 1000.0)),
	}, nil
}

func (r *ooklaRunner) Run(ctx context.Context) (res *agent.Measurement, err error) {
	return r.RunForInterface(ctx, "")
}

func (r *ooklaRunner) RunForInterface(ctx context.Context, name string) (res *agent.Measurement, err error) {
	log.Println("Ookla - Starting Speed Test for Interface:", name)
	for i := 0; i < r.MaxRetries; i++ {
		log.Printf("Ookla - Attempt %d of %d", i+1, r.MaxRetries)
		res, err = r.run(ctx, name)
		if err == nil {
			log.Println("Ookla - Finished Speed Test for Interface", name)
			return
		}
		log.Printf("Ookla - Error running speed test: %v\n", err)
	}
	return nil, errors.W(err)
}
