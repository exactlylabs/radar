package wifi

type EventType int

const (
	Connected = iota
	Disconnected
	PasswordChanged
)

type Event struct {
	Type EventType
	SSID string
}

// WirelessClient is an interface with the system wireless interface
type WirelessClient interface {

	// InterfaceName of the Wlan this client is connected to
	InterfaceName() string

	// StartSubscriptions for the wifi interface events, such as Connected/Disconnected.
	// When `Close()` gets called, the returning channel gets closed.
	StartSubscriptions() (<-chan Event, error)

	// AccessPoints lists all scanneable AccessPoints
	ScanAccessPoints() ([]APDetails, error)

	// Connect to a given SSID. If it is already registered, psk can be empty, but if it fails to connect, the code must try to connect using the given password
	Connect(ssid, psk string) error

	// Select an SSID that is already registered in the device.
	Select(ssid string) error

	// Disconnect from the current connected network
	Disconnect() error

	// ConnectionStatus of the current connected SSID. If no connection, then returns ErrNotConnected
	ConnectionStatus() (WifiStatus, error)

	// Close this client connection to the interface and any subscription.
	Close() error
}

func NewWirelessClient(wlanInterface string) (WirelessClient, error) {
	return newClient(wlanInterface)
}
