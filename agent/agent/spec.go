package agent

import (
	"context"

	"github.com/exactlylabs/radar/agent/services/sysinfo"
)

type BinaryUpdate struct {
	Version   string `json:"version"`
	BinaryUrl string `json:"binary_url"`
}
type ServerMessage struct {
	TestRequested  bool
	Update         *BinaryUpdate
	WatchdogUpdate *BinaryUpdate
}

type Pinger interface {
	Ping(meta *sysinfo.ClientMeta) (*ServerMessage, error)
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
	SendMeasurement(ctx context.Context, testStyle string, measurement []byte) error
}

type Runner interface {
	Run(ctx context.Context) (*Measurement, error)
	Type() string
}

type Rebooter interface {
	Reboot() error
}

type RadarClient interface {
	Connect(ctx context.Context, ch chan<- *ServerMessage) error
	Close() error
	MeasurementReporter
	Registerer
	Pinger
}
