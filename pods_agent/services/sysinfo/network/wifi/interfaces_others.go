//go:build !linux

package wifi

func WlanInterfaceNames() ([]string, error) {
	return nil, ErrNotSupported
}
