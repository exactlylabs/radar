package messages

import (
	"github.com/exactlylabs/radar/pods_agent/agent"
)

// TestRequestedSubscriptionPayload has the payload sent from the server, when it asks for a test
type TestRequestedSubscriptionPayload struct {
	TestRequested bool `json:"test_requested"`
}

// VersionChangedSubscriptionPayload has the payload sent from the server when the server wants to update this agent
type VersionChangedSubscriptionPayload struct {
	agent.UpdateBinaryServerMessage
}

type EnableTailscaleSubscriptionPayload struct {
	KeyId   string   `json:"key_id"`
	AuthKey string   `json:"auth_key"`
	Tags    []string `json:"tags"`
}

type DisableTailscaleSubscriptionPayload struct {
	KeyId string `json:"key_id"`
}
