package restapi

type ServerOption func(server *WebServer) error

func WithRecoveryMiddleware(middleware Middleware) ServerOption {
	return func(server *WebServer) error {
		server.recoveryMiddleware = middleware
		return nil
	}
}

func WithRequestLoggerMiddleware(middleware Middleware) ServerOption {
	return func(server *WebServer) error {
		server.loggerMiddleware = middleware
		return nil
	}
}
