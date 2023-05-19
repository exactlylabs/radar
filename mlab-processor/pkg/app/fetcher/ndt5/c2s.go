package ndt5

import "time"

// This code is based on https://github.com/m-lab/ndt-server/blob/28658e3bed77eb512aa8c7873abbb519745c92a8/ndt5/c2s/c2s.go

// ArchivalData is the data saved by the C2S test. If a researcher wants deeper
// data, then they should use the UUID to get deeper data from tcp-info.
type C2S struct {
	// The server and client IP are here as well as in the containing struct
	// because happy eyeballs means that we may have a IPv4 control connection
	// causing a IPv6 connection to the test port or vice versa.
	ServerIP   string
	ServerPort int
	ClientIP   string
	ClientPort int

	// This is the only field that is really required.
	UUID string

	// These fields are here to enable analyses that don't require joining with tcp-info data.
	StartTime          time.Time
	EndTime            time.Time
	MeanThroughputMbps float64
	// TODO: Add TCPEngine (bbr, cubic, reno, etc.)

	Error string `json:",omitempty"`
}
