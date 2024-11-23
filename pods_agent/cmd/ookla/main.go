package main

import (
	"context"
	"fmt"

	ookla "github.com/exactlylabs/radar/pods_agent/services/ooklarunner"
)

func main() {
	ookla := ookla.New()
	if err := ookla.Setup(); err != nil {
		panic(err)
	}
	ctx := context.Background()
	result, err := ookla.Run(ctx)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(result.Raw))
}
