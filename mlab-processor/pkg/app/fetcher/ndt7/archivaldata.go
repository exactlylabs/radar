package ndt7

// Base on https://github.com/m-lab/ndt-server/blob/28658e3bed77eb512aa8c7873abbb519745c92a8/ndt7/model/archivaldata.go

import (
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt"
)

// ArchivalData saves all instantaneous measurements over the lifetime of a test.
type ArchivalData struct {
	UUID               string
	StartTime          time.Time
	EndTime            time.Time
	ServerMeasurements []Measurement
	ClientMeasurements []Measurement
	ClientMetadata     []ndt.NameValue `json:",omitempty"`
}

// The Measurement struct contains measurement results. This structure is
// meant to be serialised as JSON as sent as a textual message. This
// structure is specified in the ndt7 specification.
type Measurement struct {
	AppInfo        *AppInfo        `json:",omitempty"`
	ConnectionInfo *ConnectionInfo `json:",omitempty" bigquery:"-"`
	BBRInfo        *BBRInfo        `json:",omitempty"`
	TCPInfo        *TCPInfo        `json:",omitempty"`
}

// AppInfo contains an application level measurement. This structure is
// described in the ndt7 specification.
type AppInfo struct {
	NumBytes    int64
	ElapsedTime int64
}

// ConnectionInfo contains connection info. This structure is described
// in the ndt7 specification.
type ConnectionInfo struct {
	Client string
	Server string
	UUID   string `json:",omitempty"`
}

// The BBRInfo struct contains information measured using BBR. This structure is
// an extension to the ndt7 specification. Variables here have the same
// measurement unit that is used by the Linux kernel.
type BBRInfo struct {
	ndt.BBRInfo
	ElapsedTime int64
}

// The TCPInfo struct contains information measured using TCP_INFO. This
// structure is described in the ndt7 specification.
type TCPInfo struct {
	ndt.LinuxTCPInfo
	ElapsedTime int64
}
