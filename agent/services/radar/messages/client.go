package messages

import "encoding/json"

// CommandType is the types of commands accepted by the server
type CommandType string

const (
	Subscribe   CommandType = "subscribe"
	Unsubscribe CommandType = "unsubscribe"
	Message     CommandType = "message" // Use when sending custom actions
)

// CustomActionTypes has the custom actions the server exposes
type CustomActionTypes string

const (
	Sync CustomActionTypes = "sync"
	Pong CustomActionTypes = "pong"
)

type CustomActionData struct {
	Action  CustomActionTypes `json:"action"`
	Payload interface{}       `json:"payload"`
}

// MarshalJSON is needed because of the server expecting a double encoded payload
func (mc CustomActionData) MarshalJSON() ([]byte, error) {
	v := map[string]interface{}{"action": mc.Action, "payload": mc.Payload}
	data, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	return json.Marshal(string(data))
}

// ClientMessage is the message structure expected by the server
type ClientMessage struct {
	Identifier *Identifier       `json:"identifier"`
	ActionData *CustomActionData `json:"data,omitempty"`
	Command    CommandType       `json:"command"`
}
