package messages

type RadarSubscriptionMessage struct {
	Type    string `json:"type"`
	Payload []byte `json:"payload"`
}
