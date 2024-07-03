package wifi

type WifiStatus struct {
	BSSID     string `json:"bssid"`
	Status    string `json:"status"`
	IP        string `json:"ip"`
	Signal    int    `json:"signal"`
	TxSpeed   int    `json:"tx_speed"`
	Frequency int    `json:"frequency"`
	Channel   int    `json:"channel"`
	Width     string `json:"width"`
	Noise     int    `json:"noise"` // Rpi Driver always returning 9999
	SSID      string `json:"ssid"`
}
