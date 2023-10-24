package netroute

import (
	"net"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

var ErrDefaultRouteNotFound = errors.NewSentinel("DefaultRouteNotFound", "failed to find route")

// Route is a network route, that stores the destination IP and through which interface the packages goes to
type Route struct {
	// Gateway IP that our default route goes to
	GatewayIp net.IP
	// Network Interface that we use to send packages to the gateway
	Interface *net.Interface
}
