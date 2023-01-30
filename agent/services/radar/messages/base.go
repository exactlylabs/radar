package messages

import "encoding/json"

type CommandType string

const (
	Subscribe   CommandType = "subscribe"
	Unsubscribe CommandType = "unsubscribe"
	Message     CommandType = "message"
)

type MessageType string

const (
	Welcome             MessageType = "welcome"
	Disconnect          MessageType = "disconnect"
	Ping                MessageType = "ping"
	ConfirmSubscription MessageType = "confirm_subscription"
	RejectSubscription  MessageType = "reject_subscription"
)

type Identifier struct {
	Channel string `json:"channel"`
}

func (i *Identifier) MarshalJSON() ([]byte, error) {
	// Surprisingly, it seems that we need to send a string of a json instead of the json message
	// hence we double marshal the contents
	v := map[string]interface{}{
		"channel": i.Channel,
	}
	data, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	return json.Marshal(string(data))
}

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
	return nil
}

type MessageCommandType string
type MessageCommand struct {
	Action  MessageCommandType `json:"action"`
	Payload interface{}        `json:"payload"`
}

func (mc MessageCommand) MarshalJSON() ([]byte, error) {
	v := map[string]interface{}{"action": mc.Action, "payload": mc.Payload}
	data, err := json.Marshal(v)
	if err != nil {
		return nil, err
	}
	return json.Marshal(string(data))
}

type ReceiveMessage struct {
	Type       MessageType `json:"type"`       // ping, welcome, confirm_subscription, disconnect -- for broadcasted messages it will come empty
	Identifier *Identifier `json:"identifier"` // escaped JSON
	Message    interface{} `json:"message"`    // content from the subscription
}

func (rm ReceiveMessage) FillFromPayload(obj interface{}) {
	data, err := json.Marshal(rm.Message)
	if err != nil {
		return
	}
	json.Unmarshal(data, obj)
}

type SendCommand struct {
	Identifier *Identifier `json:"identifier"` // Needs to be an escaped JSON
	Data       interface{} `json:"data,omitempty"`
	Command    CommandType `json:"command"`
}
