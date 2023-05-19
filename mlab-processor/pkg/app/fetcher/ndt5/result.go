package ndt5

import "time"

// This code is based on https://github.com/m-lab/ndt-server/blob/28658e3bed77eb512aa8c7873abbb519745c92a8/data/result.go

type ConnectionType string

// NDT5Result is the struct that is serialized as JSON to disk as the archival
// record of an NDT test.
//
// This struct is dual-purpose. It contains the necessary data to allow joining
// with tcp-info data and traceroute-caller data as well as any other UUID-based
// data. It also contains enough data for interested parties to perform
// lightweight data analysis without needing to join with other tools.
//
// WARNING: The BigQuery schema is inferred directly from this structure. To
// preserve compatibility with historical data, never remove fields.
// For more information see: https://github.com/m-lab/etl/issues/719
type NDT5Result struct {
	// GitShortCommit is the Git commit (short form) of the running server code.
	GitShortCommit string
	// Version is the symbolic version (if any) of the running server code.
	Version string

	// All data members should all be self-describing. In the event of confusion,
	// rename them to add clarity rather than adding a comment.
	ServerIP   string
	ServerPort int
	ClientIP   string
	ClientPort int

	StartTime time.Time
	EndTime   time.Time

	// ndt5
	Control *Control `json:",omitempty"`
	C2S     *C2S     `json:",omitempty"`
	S2C     *S2C     `json:",omitempty"`
}
