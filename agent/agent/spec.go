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

type RegisteredPod struct {
	ClientId string
	Secret   string
}

type Measurement struct {
	Raw          []byte
	DownloadMbps float64
	UploadMbps   float64
}

type Runner interface {
	Run(ctx context.Context) (*Measurement, error)
	Type() string
}

type Rebooter interface {
	Reboot() error
}

type RadarClient interface {
	Register(registrationToken *string) (*RegisteredPod, error)
	SendMeasurement(ctx context.Context, testStyle string, measurement []byte) error
	Ping(meta *sysinfo.ClientMeta) (*ServerMessage, error)
	Connect(ctx context.Context, ch chan<- *ServerMessage) error
	Connected() bool
	Close() error
}
