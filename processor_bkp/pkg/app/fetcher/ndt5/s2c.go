package ndt5

import (
	"time"

	"github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt"
)

// This code is based on https://github.com/m-lab/ndt-server/blob/28658e3bed77eb512aa8c7873abbb519745c92a8/ndt5/s2c/s2c.go

// S2C is the data saved by the S2C test. If a researcher wants deeper
// data, then they should use the UUID to get deeper data from tcp-info.
type S2C struct {
	// This is the only field that is really required.
	UUID string

	// All subsequent fields are here to enable analyses that don't require joining
	// with tcp-info data.

	// The server and client IP are here as well as in the containing struct
	// because happy eyeballs means that we may have a IPv4 control connection
	// causing a IPv6 connection to the test port or vice versa.
	ServerIP   string
	ServerPort int
	ClientIP   string
	ClientPort int

	StartTime          time.Time
	EndTime            time.Time
	MeanThroughputMbps float64
	MinRTT             time.Duration
	MaxRTT             time.Duration
	SumRTT             time.Duration
	CountRTT           uint32
	ClientReportedMbps float64
	// TODO: Add TCPEngine (bbr, cubic, reno, etc.), MaxThroughputKbps, and Jitter

	TCPInfo *ndt.LinuxTCPInfo `json:",omitempty"`
	Error   string            `json:",omitempty"`
}
