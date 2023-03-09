package radar

// Pod is returned when you call Register method
type Pod struct {
	Id        int64   `json:"id"`
	Secret    string  `json:"secret"`
	ClientId  string  `json:"unix_user"`
	Name      *string `json:"name"`
	PublicKey *string `json:"public_key"`
}

type Update struct {
	Version string `json:"version"`
	Url     string `json:"url"`
}

// PodConfigs is the response from the Ping method
type PodConfigs struct {
	Pod
	TestRequested  bool    `json:"test_requested"`
	Update         *Update `json:"update"`
	WatchdogUpdate *Update `json:"watchdog_update"`
}

type WatchdogStatusResponse struct {
	Pod
	Update *Update `json:"update"`
}
