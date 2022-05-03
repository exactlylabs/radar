package tracing

import (
	"strings"
	"time"

	"github.com/exactlylabs/radar/agent/config"
	"github.com/exactlylabs/radar/agent/internal/info"
	"github.com/getsentry/sentry-go"
)

func NotifyPanic() {
	// Clone the current hub so that modifications of the scope are visible only
	// within this function.
	hub := sentry.CurrentHub().Clone()

	// filterFrames removes frames from outgoing events that reference the
	// NotifyPanic function and its subfunctions.
	filterFrames := func(event *sentry.Event) {
		for _, e := range event.Exception {
			if e.Stacktrace == nil {
				continue
			}
			frames := e.Stacktrace.Frames[:0]
			for _, frame := range e.Stacktrace.Frames {
				if frame.Module == "github.com/exactlylabs/radar/agent/services/tracing" &&
					strings.HasPrefix(frame.Function, "NotifyPanic") {
					continue
				}
				frames = append(frames, frame)
			}
			e.Stacktrace.Frames = frames
		}
	}
	// Add an EventProcessor to the scope. The event processor is a function
	// that can change events before they are sent to Sentry.
	// Alternatively, see also ClientOptions.BeforeSend, which is a special
	// event processor applied to all events.
	hub.ConfigureScope(func(scope *sentry.Scope) {
		scope.AddEventProcessor(func(event *sentry.Event, hint *sentry.EventHint) *sentry.Event {
			filterFrames(event)
			return event
		})
	})

	if x := recover(); x != nil {
		hub.Recover(x)
		// Because the goroutine running this code is going to crash the
		// program, call Flush to send the event to Sentry before it is too
		// late. Set the timeout to an appropriate value depending on your
		// program, what is the maximum time to wait before giving up and
		// dropping the event.
		hub.Flush(2 * time.Second)
		// Note that if multiple goroutines panic, possibly only the first
		// one to call Flush will succeed in sending the event. If you want
		// to capture multiple panics and still crash the program
		// afterwards, you need to coordinate error reporting and
		// termination differently.
		panic(x)
	}
}

func init() {
	c := config.LoadConfig()
	err := sentry.Init(sentry.ClientOptions{
		Dsn:     c.SentryDsn,
		Release: info.BuildInfo().Version,
	})
	if err != nil {
		panic(err)
	}
}
