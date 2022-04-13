package ndt7speedtest

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"

	"github.com/exactlylabs/radar/agent/agent"
	"github.com/m-lab/ndt7-client-go"
	"github.com/m-lab/ndt7-client-go/spec"
)

const (
	clientName    string = "exactlylabs-radar"
	clientVersion string = "0.0.1"
)

type measurementValue struct {
	Key   string
	Value spec.Measurement
}

type value struct {
	Value float64
}

type summary struct {
	Download value
	Upload   value
	MinRTT   value
}

type ndt7Runner struct {
	client *ndt7.Client
}

// New ND7 speedtest runner
func New() agent.Runner {
	return &ndt7Runner{
		client: ndt7.NewClient(clientName, clientVersion),
	}
}

func (r *ndt7Runner) runTest(ctx context.Context, w io.Writer, testFn func(context.Context) (<-chan spec.Measurement, error)) error {
	measurementsCh, err := testFn(ctx)
	if err != nil {
		return err
	}

	for m := range measurementsCh {
		data, err := json.Marshal(measurementValue{Key: "measurement", Value: m})
		if err != nil {
			return fmt.Errorf("ndt7.ndt7Runner#runTest failed marshalling row: %w", err)
		}
		w.Write(data)
		w.Write([]byte("\n"))
	}
	return nil
}

func (r *ndt7Runner) writeSummary(w io.Writer) error {
	s := summary{}
	results := r.client.Results()
	if dl, ok := results[spec.TestDownload]; ok {
		if dl.Client.AppInfo != nil && dl.Client.AppInfo.ElapsedTime > 0 {
			elapsed := float64(dl.Client.AppInfo.ElapsedTime) / 1e06
			s.Download = value{
				Value: (8.0 * float64(dl.Client.AppInfo.NumBytes)) /
					elapsed / (1000.0 * 1000.0),
			}
		}
		if dl.Server.TCPInfo != nil {
			s.MinRTT = value{
				Value: float64(dl.Server.TCPInfo.MinRTT) / 1000,
			}
		}
	}
	// Upload comes from the client-side Measurement during the upload test.
	if ul, ok := results[spec.TestUpload]; ok {
		if ul.Client.AppInfo != nil && ul.Client.AppInfo.ElapsedTime > 0 {
			elapsed := float64(ul.Client.AppInfo.ElapsedTime) / 1e06
			s.Upload = value{
				Value: (8.0 * float64(ul.Client.AppInfo.NumBytes)) /
					elapsed / (1000.0 * 1000.0),
			}
		}
	}

	data, err := json.Marshal(s)
	if err != nil {
		return fmt.Errorf("ndt7.ndt7Runner#writeSummary error marshaling: %w", err)
	}
	w.Write(data)
	return nil
}

func (r *ndt7Runner) Type() string {
	return "NDT7"
}

func (r *ndt7Runner) Run(ctx context.Context) (res []byte, err error) {
	log.Println("NDT7 - Starting Speed Test")
	log.Println("NDT7 - Starting Download Test")
	b := &bytes.Buffer{}
	err = r.runTest(ctx, b, r.client.StartDownload)
	if err != nil {
		return nil, fmt.Errorf("speedtest.ndt7Runner#Run download error: %w", err)
	}
	log.Println("NDT7 - Starting Upload Test")
	err = r.runTest(ctx, b, r.client.StartUpload)
	if err != nil {
		return nil, fmt.Errorf("speedtest.ndt7Runner#Run upload error: %w", err)
	}
	r.writeSummary(b)
	log.Println("NDT7 - Speed Test Finished")
	res, err = io.ReadAll(b)
	if err != nil {
		return nil, fmt.Errorf("speedtest.ndt7Runner#Run failed reading buffer: %w", err)
	}
	return res, nil
}
