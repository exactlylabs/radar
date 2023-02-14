package messages

import "github.com/exactlylabs/radar/agent/agent"

// SubscriptionMessage has the base structure of ServerMessage.Message
// when receiving a Subscription message from the server
type SubscriptionMessage struct {
	Event   string `json:"type"`
	Payload []byte `json:"payload"`
}

// TestRequestedSubscriptionPayload has the payload sent from the server, when it asks for a test
type TestRequestedSubscriptionPayload struct {
	TestRequested bool `json:"test_requested"`
}

// UpdateRequestedSubscriptionPayload has the payload sent from the server when the server wants to update this agent
type UpdateRequestedSubscriptionPayload struct {
	// Client is the path to update this agent
	Client *agent.BinaryUpdate `json:"client"`
	// Watchdog is the path to update this agent's Watchdog -- Only applicable when in one of our managed pods
	Watchdog *agent.BinaryUpdate `json:"watchdog"`
}
