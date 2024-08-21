package bufferedsentry

import (
	sentry "github.com/exactlylabs/go-monitor/pkg/sentry"
)

var disabled = false

func Setup(dsn, clientId, version string, environment string, application string, queue Queue) {
	if disabled {
		dsn = ""
	}
	sentry.Setup(dsn, version, environment, application, sentry.WithTransport(newCustomSentryTranport(queue, dsn)))
	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetUser(sentry.User{ID: clientId})
	})
}
