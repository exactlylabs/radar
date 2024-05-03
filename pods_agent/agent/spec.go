package agent

import (
	"context"

	"github.com/exactlylabs/radar/pods_agent/services/sysinfo"
)

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

type PodInfo struct {
	Id         int    `json:"id"`
	ClientId   string `json:"unix_user"`
	Secret     string `json:"secret"`
	LocationId int    `json:"location_id"`
	AccountId  int    `json:"account_id"`
}

type Measurement struct {
	Raw          []byte
	DownloadMbps float64
	UploadMbps   float64
}

type RegisterPodInfo struct {
	RegistrationToken *string `json:"registration_token"`
	Name              *string `json:"name"`
	Label             *string `json:"register_label"` // Allow to send a label to trace this pod
}

type MeasurementReport struct {
	Result         []byte `json:"result"`
	Interface      string `json:"interface"`
	Wlan           bool   `json:"wlan"`
	ConnectionInfo any    `json:"connection_info"`
}

type NetworkData struct {
	ID           *int    `json:"id"`
	Name         string  `json:"name"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
	Address      string  `json:"address"`
	DownloadMbps float64 `json:"expected_mbps_down"`
	UploadMbps   float64 `json:"expected_mbps_up"`
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
	Register(podInfo RegisterPodInfo) (*PodInfo, error)
	SendMeasurement(ctx context.Context, testStyle string, measurement MeasurementReport) error
	Ping(meta *sysinfo.ClientMeta) ([]ServerMessage, error)
	AssignPodToAccount(accountToken string, network *NetworkData) (*PodInfo, error)
	Connect(ctx context.Context, ch chan<- *ServerMessage) error
	Connected() bool
	Close() error
}
