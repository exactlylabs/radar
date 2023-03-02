package cable

import "encoding/json"

// CommandType accepted by ActionCable protocol
type CommandType string

const (
	Subscribe   CommandType = "subscribe"
	Unsubscribe CommandType = "unsubscribe"
	Message     CommandType = "message" // Use when sending custom actions
)

// CustomActionTypes that a specific channel exposes
type CustomActionTypes string

// CustomActionData is the payload sent to the server for a Message CommandType
// its Payload depends on the Action called and is specific to a channel
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
