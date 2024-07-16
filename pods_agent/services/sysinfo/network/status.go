package network

import (
	"context"
	"net"
	"time"
)

var pingAddresses = []string{
	"8.8.8.8:53", "8.8.4.4:53", // Google
	"1.1.1.1:53", // Cloudflare

}

func networkInternetStatus(iface net.Interface) NetStatus {
	isRunning := iface.Flags&net.FlagRunning != 0
	isUp := iface.Flags&net.FlagUp != 0
	addrs, _ := iface.Addrs()

	if !isRunning || !isUp || len(addrs) == 0 {
		return Disconnected
	}

	status := ConnectedNoInternet
	if iface.Flags&net.FlagPointToPoint != 0 {
		return status
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	ret := make(chan bool)

	for _, address := range pingAddresses {
		go func(address string) {
			ret <- pingServer(ctx, iface, address)
		}(address)
	}

	for i := 0; i < len(pingAddresses); i++ {
		if <-ret {
			return ConnectedWithInternet
		}
	}

	return status
}

func pingServer(ctx context.Context, iface net.Interface, address string) bool {
	d := new(net.Dialer)
	addrs, err := iface.Addrs()
	if err != nil {
		return false
	}

	d.LocalAddr = &net.TCPAddr{IP: addrs[0].(*net.IPNet).IP}
	d.Timeout = 5 * time.Second
	conn, err := d.DialContext(ctx, "tcp", address)
	if err != nil {
		return false
	}
	conn.Close()

	return true
}
