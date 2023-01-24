package restapi

import "github.com/gorilla/handlers"

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

type CORSOptions struct {
	Origins []string
	Methods []string
	Headers []string
}

var defaultCORSOptions = CORSOptions{
	Origins: nil,
	Methods: []string{"GET", "POST", "PUT", ""},
}

func WithCORS(opts CORSOptions) ServerOption {
	corsOpts := []handlers.CORSOption{}
	if opts.Origins != nil {
		corsOpts = append(corsOpts, handlers.AllowedOrigins(opts.Origins))
	}
	if opts.Headers != nil {
		corsOpts = append(corsOpts, handlers.AllowedHeaders(opts.Headers))
	}
	if opts.Methods != nil {
		corsOpts = append(corsOpts, handlers.AllowedMethods(opts.Methods))
	}
	return func(server *WebServer) error {
		server.AddMiddlewares(handlers.CORS(corsOpts...))
		return nil
	}
}
