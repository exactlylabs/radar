package main

import (
	"context"
	"fmt"

	"github.com/exactlylabs/radar/agent/services/ookla"
)

func main() {
	ookla := ookla.New()
	ctx := context.Background()
	result, err := ookla.Run(ctx)
	if err != nil {
		panic(err)
	}

	fmt.Println(string(result.Raw))
}
