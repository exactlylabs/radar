//go:build !linux

package wifi

func newClient(wlanInterface string, ch chan Event) (WirelessClient, error) {
	return nil, ErrNotSuported
}
