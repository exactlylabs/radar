package netroute

import (
	"bufio"
	"bytes"
	"net"
	"os/exec"
	"strings"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

func DefaultRoute() (r Route, err error) {
	cmd := exec.Command("route", "print", "0.0.0.0")
	stderr := new(bytes.Buffer)
	cmd.Stderr = stderr
	out, err := cmd.CombinedOutput()
	if err != nil {
		return r, errors.Wrap(err, "failed to run fetch gateway route: %s", string(out)).WithMetadata(errors.Metadata{
			"stderr": stderr.String(), "stdout": string(out),
		})
	}
	routeContent := ""
	// windows doesn't have a good format to parse
	// so we need to infer based on the number of columns and if our parsings don't fail
	scanner := bufio.NewScanner(bytes.NewReader(out))
	for scanner.Scan() {
		row := scanner.Text()
		routeContent += row + "\n"
		fields := strings.Fields(row)
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
				return r, errors.W(err).WithMetadata(errors.Metadata{"content": routeContent, "interfaceIp": interfaceIp.String()})
			}
			r.Interface = &iface
			return r, nil
		}
	}
	return r, errors.SentinelWithStack(ErrDefaultRouteNotFound).WithMetadata(errors.Metadata{"content": routeContent})
}

func interfaceByIP(ip net.IP) (net.Interface, error) {
	// as seen, we don't have the interface name, but the IP this interface has
	ifaces, err := net.Interfaces()
	if err != nil {
		panic(errors.Wrap(err, "net.Interfaces failed"))
	}
	for _, iface := range ifaces {
		addrs, err := iface.Addrs()
		if err != nil {
			panic(errors.Wrap(err, "failed to grab addresses for interface").WithMetadata(errors.Metadata{"interface": iface.Name}))
		}
		for _, addr := range addrs {
			addrClean := strings.Split(addr.String(), "/")[0]
			if net.ParseIP(addrClean).Equal(ip) {
				return iface, nil
			}
		}
	}
	return net.Interface{}, errors.SentinelWithStack(ErrDefaultRouteNotFound).WithMetadata(errors.Metadata{"interfaces": ifaces})
}
