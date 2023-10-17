package cable

import (
	"encoding/json"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

// MessageType tells us which type of message the server is sending to us
type MessageType string

const (
	Welcome             MessageType = "welcome"
	Disconnect          MessageType = "disconnect"
	Ping                MessageType = "ping"
	ConfirmSubscription MessageType = "confirm_subscription"
	RejectSubscription  MessageType = "reject_subscription"
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
		return nil, errors.Wrap(err, "json.Marshal failed")
	}
	return json.Marshal(string(data))
}

// UnmarshalJSON undoes the double encoding
func (i *Identifier) UnmarshalJSON(data []byte) error {
	strJSON := ""
	if err := json.Unmarshal(data, &strJSON); err != nil {
		return errors.Wrap(err, "json.Unmarshal failed")
	}
	v := make(map[string]interface{})
	if err := json.Unmarshal([]byte(strJSON), &v); err != nil {
		return errors.Wrap(err, "json.Unmarshal failed")
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
func (sm ServerMessage) DecodeMessage(obj interface{}) error {
	data, err := sm.EncodedMessage()
	if err != nil {
		return errors.W(err)
	}
	if err := json.Unmarshal(data, obj); err != nil {
		return errors.Wrap(err, "json.Unmarshal failed").WithMetadata(errors.Metadata{"message": string(data)})
	}
	return nil
}

// EncodedMessage tries to transform the Message field in an encoded JSON
func (sm ServerMessage) EncodedMessage() ([]byte, error) {
	data, err := json.Marshal(sm.Message)
	if err != nil {
		return nil, errors.Wrap(err, "json.Marshal failed")
	}
	return data, nil
}

// SubscriptionMessage is the content a Subscription MessageType
type SubscriptionMessage struct {
	Event   string          `json:"event"`
	Payload json.RawMessage `json:"payload"`
}
