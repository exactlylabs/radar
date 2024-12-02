package main

import (
	"context"
	"fmt"

	ndt7speedtest "github.com/exactlylabs/radar/pods_agent/services/ndt7"
)

func main() {
	// Run NDT7

	runner := ndt7speedtest.New()
	if err := runner.Setup(); err != nil {
		panic(err)
	}
	ctx := context.Background()
	result, err := runner.Run(ctx)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(result.Raw))
}
