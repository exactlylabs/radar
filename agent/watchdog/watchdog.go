package watchdog

import (
	"context"
	"os"

	"github.com/exactlylabs/radar/agent/watchdog/display"
)

// Run is a blocking function that starts all routines related to the Watchdog.
func Run(ctx context.Context, sysManager SystemManager, agentCli display.AgentClient) {
	go display.StartDisplayLoop(ctx, os.Stdout, agentCli, sysManager)
	StartScanLoop(ctx, sysManager)
}
