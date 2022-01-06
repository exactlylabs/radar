package ndt7

import "time"

// This code is based on https://github.com/m-lab/ndt-server/blob/28658e3bed77eb512aa8c7873abbb519745c92a8/data/result.go

// NDT7Result is the struct that is serialized as JSON to disk as the archival
// record of an NDT7 test. This is similar to, but independent from, the NDT5Result.
type NDT7Result struct {
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

	// ndt7
	Upload   *ArchivalData `json:",omitempty"`
	Download *ArchivalData `json:",omitempty"`
}
