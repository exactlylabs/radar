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

type ConfigureWirelessNetworkPayload struct {
	SSID     string  `json:"ssid"`
	Password *string `json:"password"`
	Security string  `json:"security"`
	Identity string  `json:"identity"`
	Hidden   bool    `json:"hidden"`
	Enabled  bool    `json:"enabled"`
}

type DeleteWirelessNetworkPayload struct {
	SSID string `json:"ssid"`
}

type ScanWirelessNetworksPayload struct {
}

type ReportConnectionStatusPayload struct {
}

type SetWlanInterfacePayload struct {
	Name string `json:"interface"`
}

type DisconnectWirelessNetworkPayload struct {
}

type ReportLogsPayload struct {
	Services []string `json:"services"`
	Lines    int      `json:"lines"`
}
