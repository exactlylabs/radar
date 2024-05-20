package agent

import "github.com/exactlylabs/go-errors/pkg/errors"

// ErrServerConnectionError should be used whenever the implementing service fails to connect to the server due to network issues
// This error tells us that we should ignore it, try again later, and to not notify our Sentry instance about it.
var ErrServerConnectionError = errors.NewSentinel("ConnectionError", "failed to connect to the server")

// ErrRunnerConnectionError should be used whenever the implementing runner fails to connect to its servers due to network issues.
// This error tells us that we should ignore it, try again later, and to not notify our Sentry instance about it.
var ErrRunnerConnectionError = errors.NewSentinel("RunnerConnectionError", "runner failed to connect to the speed test server")

func errorIsAny(err error, targets ...error) bool {
	for _, target := range targets {
		if errors.Is(err, target) {
			return true
		}
	}
	return false
}
