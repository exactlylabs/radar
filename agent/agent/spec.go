package agent

import "context"

type BinaryUpdate struct {
	Version   string
	BinaryUrl string
}
type PingResponse struct {
	TestRequested bool
	Update        *BinaryUpdate
}

type NetInterfaces struct {
	Name string `json:"name"`
	MAC  string `json:"mac"`
}

type ClientMeta struct {
	Version       string
	Distribution  string
	NetInterfaces []NetInterfaces
}

type Pinger interface {
	Ping(clientId, secret string, meta *ClientMeta) (*PingResponse, error)
}

type RegisteredPod struct {
	ClientId string
	Secret   string
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
	Run(ctx context.Context) ([]byte, error)
	Type() string
}
