//go:build !linux

package wifi

func newClient(wlanInterface string) (WirelessClient, error) {
	return nil, ErrNotSuported
}
