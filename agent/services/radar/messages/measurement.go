package messages

type MeasurementResult struct {
	Result []byte `json:"result"`
	Style  string `json:"style"`
}
