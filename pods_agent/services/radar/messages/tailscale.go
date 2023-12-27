package messages

type TailscaleConnected struct {
	KeyId string `json:"key_id"`
}

type TailscaleDisconnected struct {
	KeyId string `json:"key_id"`
}
