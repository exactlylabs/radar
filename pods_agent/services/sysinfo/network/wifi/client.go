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

	// ConfigureNetwork registers the given network in the driver.
	// If Password is nil, keep the previous value
	ConfigureNetwork(network NetworkConnectionData) error

	// Forget the given SSID by removing it from the driver.
	Forget(ssid string) error

	// Enable the driver to connect to the given SSID
	Enable(ssid string) error

	// Disconnect from the current connected network
	Disconnect() error

	// ConnectionStatus of the current connected SSID. If no connection, then returns ErrNotConnected
	ConnectionStatus() (WifiStatus, error)

	// CurrentSSID the OS is connected to. Returns empty if not connected.
	CurrentSSID() string

	// ConfiguredNetworks returns a list of all networks registered in the Driver.
	ConfiguredNetworks() ([]NetworkConnectionData, error)

	// Close this client connection to the interface and any subscription.
	Close() error
}

func NewWirelessClient(wlanInterface string) (WirelessClient, error) {
	return newClient(wlanInterface)
}
