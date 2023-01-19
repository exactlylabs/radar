package netroute

import (
	"bufio"
	"bytes"
	"fmt"
	"net"
	"os/exec"
	"strings"
)

func DefaultRoute() (r Route, err error) {
	cmd := exec.Command("route", "print", "0.0.0.0")
	out, err := cmd.CombinedOutput()
	if err != nil {
		return r, fmt.Errorf("netroute.DefaultRoute CombinedOutput: %w", err)
	}

	// windows doesn't have a good format to parse
	// so we need to infer based on the number of columns and if our parsings don't fail
	scanner := bufio.NewScanner(bytes.NewReader(out))
	for scanner.Scan() {
		fields := strings.Fields(scanner.Text())
		if len(fields) == 5 {
			// possible match, check if we can convert the gateway col to an IP
			r.GatewayIp = net.ParseIP(fields[2])
			if r.GatewayIp == nil {
				// invalid, try another row
				continue
			}
			interfaceIp := net.ParseIP(fields[3])
			if interfaceIp == nil {
				// same
				continue
			}
			iface, err := interfaceByIP(interfaceIp)
			if err != nil {
				return r, err
			}
			r.Interface = &iface
			return r, nil
		}
	}
	return r, fmt.Errorf("netroute.DefaultRoute: gateway not found")
}

func interfaceByIP(ip net.IP) (net.Interface, error) {
	// as seen, we don't have the interface name, but the IP this interface has
	ifaces, err := net.Interfaces()
	if err != nil {
		panic(err)
	}
	for _, iface := range ifaces {
		addrs, err := iface.Addrs()
		if err != nil {
			panic(err)
		}
		for _, addr := range addrs {
			addrClean := strings.Split(addr.String(), "/")[0]
			if net.ParseIP(addrClean).Equal(ip) {
				return iface, nil
			}
		}
	}
	return net.Interface{}, fmt.Errorf("netroute.interfaceByIP: interface not found")
}
