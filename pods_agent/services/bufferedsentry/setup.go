package bufferedsentry

import (
	sentry "github.com/exactlylabs/go-monitor/pkg/sentry"
)

func Setup(dsn, clientId, version string, environment string, application string, bufferDir string) {
	if dsn == "" {
		return
	}
	sentry.Setup(dsn, version, environment, application, sentry.WithTransport(newCustomSentryTranport(bufferDir, dsn)))

	sentry.ConfigureScope(func(scope *sentry.Scope) {
		scope.SetUser(sentry.User{ID: clientId})
	})
}
