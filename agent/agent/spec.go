package agent

import (
	"context"

	"github.com/exactlylabs/radar/agent/services/sysinfo"
)

type BinaryUpdate struct {
	Version   string
	BinaryUrl string
}
type ServerMessage struct {
	TestRequested  bool
	Update         *BinaryUpdate
	WatchdogUpdate *BinaryUpdate
}

type Pinger interface {
	Ping(clientId, secret string, meta *sysinfo.ClientMeta) (*ServerMessage, error)
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

type OnServerMessage func(ServerMessage)
type RadarClient interface {
	Connect(ctx context.Context, callback OnServerMessage) error
	Sync(ctx context.Context, metadata sysinfo.ClientMeta) error
	SendMeasurement(ctx context.Context, data []byte) error
}
