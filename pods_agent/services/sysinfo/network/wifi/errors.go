package wifi

import "github.com/exactlylabs/go-errors/pkg/errors"

var ErrNotSuported = errors.NewSentinel("NotSupportedError", "this functionality is not supported in this system")
var ErrNotWlanInterface = errors.NewSentinel("NotWLANInterfaceError", "this interface is not a Wlan interface")
var ErrNotConnected = errors.NewSentinel("NotConnectedError", "not connected to an access point")
var ErrSSIDNotRegistered = errors.NewSentinel("NotRegisteredError", "ssid is not registered in this device. You have to connect to it first")
var ErrAuthFailed = errors.NewSentinel("AuthenticationFailedError", "authentication to the ssid has failed. Possibly wrong password")
var ErrAssociationRejected = errors.NewSentinel("AssociationRejectedError", "the access point rejected the association")
var ErrTimeout = errors.NewSentinel("TimeOutError", "the communication with the interface has timed-out")
