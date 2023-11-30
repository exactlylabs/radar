package ndt7speedtest

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"log"
	"strings"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/agent"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
	"github.com/m-lab/ndt7-client-go"
	"github.com/m-lab/ndt7-client-go/spec"
	"golang.org/x/sys/cpu"
)

const (
	clientName string = "exactlylabs-radar-pods"
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
}

// New ND7 speedtest runner
func New() agent.Runner {
	return &ndt7Runner{}
}

func (r *ndt7Runner) runTest(ctx context.Context, w io.Writer, testFn func(context.Context) (<-chan spec.Measurement, error)) error {
	measurementsCh, err := testFn(ctx)
	if err != nil {
		return err
	}

	for m := range measurementsCh {
		data, err := json.Marshal(measurementValue{Key: "measurement", Value: m})
		if err != nil {
			return errors.Wrap(err, "failed marshalling row")
		}
		w.Write(data)
		w.Write([]byte("\n"))
	}
	return nil
}

func (r *ndt7Runner) writeSummary(w io.Writer, client *ndt7.Client) (*summary, error) {
	s := &summary{}
	results := client.Results()
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
		if ul.Server.TCPInfo != nil && ul.Server.TCPInfo.BytesReceived > 0 {
			elapsed := float64(ul.Server.TCPInfo.ElapsedTime) / 1e06
			s.Upload = value{
				Value: (8.0 * float64(ul.Server.TCPInfo.BytesReceived)) /
					elapsed / (1000.0 * 1000.0),
			}
		}
	}

	data, err := json.Marshal(s)
	if err != nil {
		return nil, errors.Wrap(err, "error marshaling")
	}
	w.Write(data)
	return s, nil
}

func (r *ndt7Runner) Type() string {
	return "NDT7"
}

func (r *ndt7Runner) Run(ctx context.Context) (*agent.Measurement, error) {
	log.Println("NDT7 - Starting Speed Test")
	log.Println("NDT7 - Starting Download Test")
	client := ndt7.NewClient(clientName, sysinfo.Metadata().Version)
	client.Scheme = defaultSchemeForArch()
	b := &bytes.Buffer{}
	err := r.runTest(ctx, b, client.StartDownload)
	if errors.Is(err, ndt7.ErrNoTargets) {
		return nil, errors.SentinelWithStack(agent.ErrRunnerConnectionError).WithMetadata(errors.Metadata{"type": "ndt7", "test": "download"})

	} else if err != nil {
		if strings.Contains(err.Error(), "bad handshake") {
			// Try one more time
			log.Println("NDT7 - failed with bad handshake. Trying again in 5 seconds")
			time.Sleep(time.Second * 5)
			err = r.runTest(ctx, b, client.StartDownload)
		}
		if err != nil && strings.Contains(err.Error(), "network is unreachable") {
			return nil, errors.SentinelWithStack(agent.ErrRunnerConnectionError).WithMetadata(errors.Metadata{"type": "ndt7", "test": "download"})
		} else if err != nil {
			// There is still an error. return the error
			return nil, errors.W(err).WithMetadata(errors.Metadata{"type": "ndt7", "test": "download"})
		}

	}
	log.Println("NDT7 - Starting Upload Test")
	err = r.runTest(ctx, b, client.StartUpload)
	if errors.Is(err, ndt7.ErrNoTargets) {
		return nil, errors.SentinelWithStack(agent.ErrRunnerConnectionError).WithMetadata(errors.Metadata{"type": "ndt7", "test": "download"})

	} else if err != nil {
		if strings.Contains(err.Error(), "bad handshake") {
			// Try one more time
			log.Println("NDT7 - failed with bad handshake. Trying again in 5 seconds")
			time.Sleep(time.Second * 5)
			err = r.runTest(ctx, b, client.StartUpload)
		}
		if err != nil && strings.Contains(err.Error(), "network is unreachable") {
			return nil, errors.SentinelWithStack(agent.ErrRunnerConnectionError).WithMetadata(errors.Metadata{"type": "ndt7", "test": "upload"})
		} else if err != nil {
			return nil, errors.W(err).WithMetadata(errors.Metadata{"type": "ndt7", "test": "upload"})
		}
	}
	summary, err := r.writeSummary(b, client)
	if err != nil {
		return nil, errors.W(err)
	}
	log.Println("NDT7 - Speed Test Finished")
	res, err := io.ReadAll(b)
	if err != nil {
		return nil, errors.Wrap(err, "reading buffer")
	}
	return &agent.Measurement{
		Raw:          res,
		DownloadMbps: summary.Download.Value,
		UploadMbps:   summary.Upload.Value,
	}, nil
}

// defaultSchemeForArch returns the default WebSocket scheme to use, depending
// on the architecture we are running on. A CPU without native AES instructions
// will perform poorly if TLS is enabled.
// Took from https://github.com/m-lab/ndt7-client-go/blob/master/cmd/ndt7-client/main.go#L194
func defaultSchemeForArch() string {
	if cpu.ARM64.HasAES || cpu.ARM.HasAES || cpu.X86.HasAES {
		return "wss"
	}
	return "ws"
}
