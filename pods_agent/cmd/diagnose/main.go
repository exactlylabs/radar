package main

import (
	"encoding/json"
	"fmt"

	"github.com/exactlylabs/radar/pods_agent/services/ndt7/ndt7diagnose"
)

func main() {
	resp, err := ndt7diagnose.RunDiagnose()
	if err != nil {
		panic(err)
	}
	res, err := json.Marshal(resp)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(res))
}
