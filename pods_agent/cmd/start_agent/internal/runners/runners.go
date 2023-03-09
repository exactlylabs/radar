package runners

import (
	"os"

	"github.com/exactlylabs/radar/pods_agent/agent"
	"github.com/exactlylabs/radar/pods_agent/internal/info"
	ndt7speedtest "github.com/exactlylabs/radar/pods_agent/services/ndt7"
	"github.com/exactlylabs/radar/pods_agent/services/ookla"
)

func GetRunners() []agent.Runner {
	if info.IsDev() && os.Getenv("USE_RUNNERS") == "" {
		return []agent.Runner{
			ndt7speedtest.NewMockedRunner(),
			ookla.NewMockedRunner(),
		}
	}
	return []agent.Runner{
		ndt7speedtest.New(),
		ookla.New(),
	}
}
