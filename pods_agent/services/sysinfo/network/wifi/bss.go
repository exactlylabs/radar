package wifi

type BSSInfo struct {
	ID            uint8    `json:"id"`
	BSSID         string   `json:"bssid"`
	SSID          string   `json:"ssid"`
	Freq          int      `json:"freq"`
	BeaconInt     uint16   `json:"beacon_int"`
	Caps          uint16   `json:"capacity"`
	Qual          int      `json:"quality"`
	Noise         int      `json:"noise"`
	Level         int      `json:"level"`
	TSF           uint64   `json:"tsf"`
	Age           uint     `json:"age"`
	EstThroughput uint     `json:"est_throughput"`
	SNR           int      `json:"snr"`
	Flags         []string `json:"flags"`
}
