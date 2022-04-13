package main

import (
	"context"
	"fmt"

	ndt7speedtest "github.com/exactlylabs/radar/agent/services/ndt7"
)

func main() {
	// Run NDT7

	runner := ndt7speedtest.New()

	ctx := context.Background()
	result, err := runner.Run(ctx)
	if err != nil {
		panic(err)
	}
	fmt.Println(string(result))
}
