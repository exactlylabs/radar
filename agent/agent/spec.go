package agent

import "context"

type PingResponse struct {
	TestRequested bool
}

type Pinger interface {
	Ping(clientId, secret string) (*PingResponse, error)
}

type RegisteredPod struct {
	ClientId string
	Secret   string
}

type Registerer interface {
	Register() (*RegisteredPod, error)
}

type MeasurementReporter interface {
	ReportMeasurement(clientId, secret, style string, measurement []byte) error
}

type Runner interface {
	Run(ctx context.Context) ([]byte, error)
	Type() string
}
