package messages

import (
	"encoding/json"
	"fmt"
)

// MessageType tells us which type of message the server is sending to us
type MessageType string

const (
	Welcome             MessageType = "welcome"
	Disconnect          MessageType = "disconnect"
	Ping                MessageType = "ping"
	ConfirmSubscription MessageType = "confirm_subscription"
	RejectSubscription  MessageType = "reject_subscription"
	RunTest             MessageType = "run_test" // Custom Type, when requested, the agent should run a speed test
	Update              MessageType = "update"   // Custom Type, when requested, the agent should update itself
)

// Identifier enables us to know from which subscription the message came,
// only subscription messages will have this filled
type Identifier struct {
	Channel string `json:"channel"`
	Id      string `json:"id"`
}

// MarshalJSON is needed because the server expects a double encoded string
func (i *Identifier) MarshalJSON() ([]byte, error) {
	v := map[string]interface{}{
		"channel": i.Channel,
		"id":      i.Id,
	}
	data, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	return json.Marshal(string(data))
}

// UnmarshalJSON undoes the double encoding
func (i *Identifier) UnmarshalJSON(data []byte) error {
	strJSON := ""
	if err := json.Unmarshal(data, &strJSON); err != nil {
		return err
	}
	v := make(map[string]interface{})
	if err := json.Unmarshal([]byte(strJSON), &v); err != nil {
		return err
	}
	i.Channel = v["channel"].(string)
	i.Id = v["id"].(string)
	return nil
}

// ServerMessage has the base structure of messages the server sends us
type ServerMessage struct {
	Type       MessageType `json:"type"`
	Identifier *Identifier `json:"identifier"`
	Message    any         `json:"message"` // []byte doesn't work because ping sends an integer type and MarshalJSON fails to parse it
}

// DecodeMessage decodes the contents from Message field into the given object
func (rm ServerMessage) DecodeMessage(obj interface{}) error {
	data, err := json.Marshal(rm.Message)
	if err != nil {
		return fmt.Errorf("messages.ServerMessage#DecodeMessage Marshal: %w", err)
	}
	if err := json.Unmarshal(data, obj); err != nil {
		return fmt.Errorf("messages.ServerMessage#DecodeMessage Unmarshal: %w", err)
	}
	return nil
}
