package cable

import (
	"log"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/go-monitor/pkg/sentry"
)

func ParseMessage[T any](msg ServerMessage) (obj T) {
	if err := msg.DecodeMessage(&obj); err != nil {
		err = errors.W(err)
		payload := msg.Message
		if bts, ok := payload.([]byte); ok {
			payload = string(bts)
		}
		sentry.NotifyError(
			err,
			map[string]sentry.Context{
				"Message": {"type": msg.Type, "payload": payload},
			},
		)
		log.Println(err)
	}
	return
}
