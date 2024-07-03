package network

import (
	"net"
	"os"
	"path/filepath"
	"slices"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/services/sysinfo/network/wifi"
)

func networkType(iface net.Interface) (netType NetType, err error) {
	netType = Virtual

	_, err = os.Stat(filepath.Join("/sys/devices/virtual/net", iface.Name))
	if err != nil && errors.Is(err, os.ErrNotExist) {
		netType = Ethernet

		wlanIfaces, err := wifi.WlanInterfaceNames()
		if err != nil && !errors.Is(err, wifi.ErrNotSupported) {
			return netType, errors.W(err)

		} else if slices.Contains(wlanIfaces, iface.Name) {
			netType = Wlan
		}
	}

	return netType, nil
}
