package messages

import "github.com/exactlylabs/radar/agent/agent"

type UpdateSubscriptionPayload struct {
	Client   *agent.BinaryUpdate `json:"client"`
	Watchdog *agent.BinaryUpdate `json:"watchdog"`
}
