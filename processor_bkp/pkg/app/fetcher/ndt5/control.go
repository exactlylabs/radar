package ndt5

import "github.com/exactlylabs/mlab-processor/pkg/app/fetcher/ndt"

// This code is based on https://github.com/m-lab/ndt-server/blob/28658e3bed77eb512aa8c7873abbb519745c92a8/ndt5/control/data.go

type Control struct {
	// These data members should all be self-describing. In the event of confusion,
	// rename them to add clarity rather than adding a comment.
	UUID            string
	Protocol        ConnectionType
	MessageProtocol string
	ClientMetadata  []ndt.NameValue `json:",omitempty"`
}
