package network

import "github.com/exactlylabs/go-errors/pkg/errors"

var ErrNotSupported = errors.NewSentinel("NotSupported", "not supported for this OS")
var ErrInterfaceNotFound = errors.NewSentinel("InterfaceNotFound", "interface not found")
var ErrInterfaceNotConnected = errors.NewSentinel("InterfaceNotConnected", "interface not connected")
