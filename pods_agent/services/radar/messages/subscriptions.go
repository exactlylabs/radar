package messages

// TestRequestedSubscriptionPayload has the payload sent from the server, when it asks for a test
type TestRequestedSubscriptionPayload struct {
	TestRequested bool     `json:"test_requested"`
	Interfaces    []string `json:"interfaces"`
}

// VersionChangedSubscriptionPayload has the payload sent from the server when the server wants to update this agent
type VersionChangedSubscriptionPayload struct {
	Version   string `json:"version"`
	BinaryUrl string `json:"binary_url"`
}

type EnableTailscaleSubscriptionPayload struct {
	KeyId   string   `json:"key_id"`
	AuthKey string   `json:"auth_key"`
	Tags    []string `json:"tags"`
}

type DisableTailscaleSubscriptionPayload struct {
	KeyId string `json:"key_id"`
}

// ConnectToWlanInterfacePayload shold be sent prior to any other Wireless-related command.
type ConnectToWlanInterfacePayload struct {
	InterfaceName string `json:"interface"`
}

type ConnectToWirelessNetworkPayload struct {
	SSID string `json:"ssid"`
	PSK  string `json:"psk"`
}

type SelectWirelessNetworkPayload struct {
	SSID string `json:"ssid"`
}

type ScanWirelessNetworksPayload struct {
}

type ReportWirelessStatusPayload struct {
}

type SetWlanInterfacePayload struct {
	Name string `json:"interface"`
}

type DisconnectWirelessNetworkPayload struct {
}
