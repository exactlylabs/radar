package agent

import (
	"context"

	"github.com/exactlylabs/radar/agent/services/sysinfo"
)

type BinaryUpdate struct {
	Version   string
	BinaryUrl string
}
type PingResponse struct {
	TestRequested  bool
	Update         *BinaryUpdate
	WatchdogUpdate *BinaryUpdate
}

type Pinger interface {
	Ping(clientId, secret string, meta *sysinfo.ClientMeta) (*PingResponse, error)
}

type RegisteredPod struct {
	ClientId string
	Secret   string
}

type Measurement struct {
	Raw          []byte
	DownloadMbps float64
	UploadMbps   float64
}

type Registerer interface {
	// Register the pod on the server.
	// If registrationToken is given, it uses it so the server knows who installed this pod
	Register(registrationToken *string) (*RegisteredPod, error)
}

type MeasurementReporter interface {
	ReportMeasurement(clientId, secret, style string, measurement []byte) error
}

type ServerClient interface {
	Pinger
	Registerer
	MeasurementReporter
}

type Runner interface {
	Run(ctx context.Context) (*Measurement, error)
	Type() string
}

type Rebooter interface {
	Reboot() error
}
