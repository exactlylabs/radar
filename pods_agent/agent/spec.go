package agent

import (
	"context"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
)

// ErrServerConnectionError should be used whenever the implementing service fails to connect to the server due to network issues
// This error tells us that we should ignore it, try again later, and to not notify our Sentry instance about it.
var ErrServerConnectionError = errors.NewSentinel("ConnectionError", "failed to connect to the server")

// ErrRunnerConnectionError should be used whenever the implementing runner fails to connect to its servers due to network issues.
// This error tells us that we should ignore it, try again later, and to not notify our Sentry instance about it.
var ErrRunnerConnectionError = errors.NewSentinel("RunnerConnectionError", "runner failed to connect to the speed test server")

// ErrInterfaceNotConnected should be used whenever a runner tries to run a test for a specific network interface and it doesn't have an IP address configured
var ErrInterfaceNotConnected = errors.NewSentinel("InterfaceNotConnectedError", "selected interface doesn't have an address configured to it")

type MessageType int

const (
	RunTest MessageType = iota
	Update
	UpdateWatchdog
)

type UpdateBinaryServerMessage struct {
	Version   string `json:"version"`
	BinaryUrl string `json:"binary_url"`
}

type RunTestServerMessage struct {
	Interfaces []string `json:"interfaces"`
}

type ServerMessage struct {
	Type MessageType
	Data any
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

type MeasurementReport struct {
	Result         []byte `json:"result"`
	Interface      string `json:"interface"`
	Wlan           bool   `json:"wlan"`
	ConnectionInfo any    `json:"connection_info"`
}

type Runner interface {
	// Run a speed test.
	// The returned error could either by an ErrRunnerConnectionError or an internal generic error
	Run(ctx context.Context) (*Measurement, error)
	// RunForInterface runs a speed test using the given interface name. If name is empty, then it should use the system's default interface
	RunForInterface(ctx context.Context, name string) (*Measurement, error)
	Type() string
}

type Rebooter interface {
	Reboot() error
}

type RadarClient interface {
	Register(registrationToken *string) (*RegisteredPod, error)
	SendMeasurement(ctx context.Context, testStyle string, measurement MeasurementReport) error
	Ping(meta *sysinfo.ClientMeta) ([]ServerMessage, error)
	Connect(ctx context.Context, ch chan<- *ServerMessage) error
	Connected() bool
	Close() error
}
