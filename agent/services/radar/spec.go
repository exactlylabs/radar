package radar

import (
	"github.com/exactlylabs/radar/agent/agent"
)

// Pod is returned when you call Register method
type Pod struct {
	Id        int64   `json:"id"`
	Secret    string  `json:"secret"`
	ClientId  string  `json:"unix_user"`
	Name      *string `json:"name"`
	PublicKey *string `json:"public_key"`
}

// PodConfigs is the response from the Ping method
type PodConfigs struct {
	Pod
	TestRequested bool `json:"test_requested"`
}

type RadarRequester interface {
	agent.Pinger
	agent.Registerer
	agent.MeasurementReporter
}
