package wifi

type AP struct {
	SSID       string `json:"ssid"`
	Connected  bool   `json:"connected"`
	Registered bool   `json:"registered"`
}

type APDetails struct {
	AP
	BSS     BSSInfo `json:"bss"`
	Channel int     `json:"channel"`
	RSSI    int     `json:"rssi"`
	Signal  int     `json:"signal"`
}

