package cable

import "github.com/exactlylabs/go-errors/pkg/errors"

var ErrNotSubscribed = errors.NewSentinel("NotSubscribed", "Client is not subscribed to any channel")
var ErrSubscriptionConfirmationTimeout = errors.NewSentinel("SubscriptionConfirmationTimeout", "client timed out waiting for subscription confirmation")
var ErrNotConnected = errors.NewSentinel("NotConnected", "The client is not connected")
