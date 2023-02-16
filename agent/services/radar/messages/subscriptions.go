package messages

import (
	"encoding/json"

	"github.com/exactlylabs/radar/agent/agent"
)

// SubscriptionMessage is the content a Subscription MessageType
type SubscriptionMessage struct {
	Event   string          `json:"event"`
	Payload json.RawMessage `json:"payload"`
}

// TestRequestedSubscriptionPayload has the payload sent from the server, when it asks for a test
type TestRequestedSubscriptionPayload struct {
	TestRequested bool `json:"test_requested"`
}

// VersionChangedSubscriptionPayload has the payload sent from the server when the server wants to update this agent
type VersionChangedSubscriptionPayload struct {
	agent.BinaryUpdate
}
