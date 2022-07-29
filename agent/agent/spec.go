package agent

import (
	"context"
	"fmt"
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

type NetInterfaces struct {
	Name string `json:"name"`
	MAC  string `json:"mac"`
}

type ClientMeta struct {
	Version           string          `json:"version"`
	Distribution      string          `json:"distribution"`
	NetInterfaces     []NetInterfaces `json:"net_interfaces"`
	WatchdogVersion   string          `json:"watchdog_version"`
	RegistrationToken *string         `json:"registration_token"`
}

func (m *ClientMeta) String() string {
	return fmt.Sprintf(`Version: %v
Distribution: %v
NetInterfaces: %+v`,
		m.Version, m.Distribution, m.NetInterfaces)
}

type Pinger interface {
	Ping(clientId, secret string, meta *ClientMeta) (*PingResponse, error)
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
