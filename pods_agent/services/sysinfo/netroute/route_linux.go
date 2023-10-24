//go:build linux

package netroute

import (
	"bufio"
	"encoding/binary"
	"net"
	"os"
	"strconv"
	"strings"

	"github.com/exactlylabs/go-errors/pkg/errors"
)

type gatewayInfo struct {
	Interface string
	Gateway   net.IP
}

func DefaultRoute() (r Route, err error) {
	info, err := getGatewayFromNetRoute()
	if err != nil {
		return r, errors.W(err)
	}
	iface, err := net.InterfaceByName(info.Interface)
	if err != nil {
		return r, errors.Wrap(err, "net.InterfaceByName failed").WithMetadata(errors.Metadata{
			"interface":  info.Interface,
			"gateway-ip": info.Gateway.String(),
		})
	}
	return Route{Interface: iface, GatewayIp: info.Gateway}, nil
}

func getGatewayFromNetRoute() (*gatewayInfo, error) {
	f, err := os.Open("/proc/net/route")
	if err != nil {
		return nil, errors.Wrap(err, "failed to open /proc/net/route")
	}
	defer f.Close()
	routeContent := ""
	scanner := bufio.NewScanner(f)
	headers := make(map[string]int)
	if !scanner.Scan() {
		return nil, errors.Wrap(scanner.Err(), "failed to scan /proc/net/route")
	}
	// Populate Headers
	row := scanner.Text()
	routeContent += row + "\n"
	columns := strings.Split(row, "\t")
	for i, c := range columns {
		headers[strings.TrimSpace(c)] = i
	}

	for scanner.Scan() {
		row = scanner.Text()
		routeContent += row + "\n"
		columns := strings.Split(row, "\t")
		gatewayAddr, err := strconv.ParseInt("0x"+columns[headers["Gateway"]], 0, 64)
		if err != nil {
			return nil, errors.Wrap(err, "failed to parse int from hex").WithMetadata(errors.Metadata{
				"gateway": columns[headers["Gateway"]],
			})
		}

		if gatewayAddr == 0 {
			// The default route has a non empty gateway address
			continue
		}
		ip := make(net.IP, 4)
		binary.LittleEndian.PutUint32(ip, uint32(gatewayAddr))
		// Found the gateway
		return &gatewayInfo{
			Interface: columns[headers["Iface"]],
			Gateway:   ip,
		}, nil
	}
	return nil, errors.SentinelWithStack(ErrDefaultRouteNotFound).WithMetadata(errors.Metadata{"content": routeContent})
}

func inet_ntoa(ipnr int64) net.IP {
	var bytes [4]byte
	bytes[0] = byte(ipnr & 0xFF)
	bytes[1] = byte((ipnr >> 8) & 0xFF)
	bytes[2] = byte((ipnr >> 16) & 0xFF)
	bytes[3] = byte((ipnr >> 24) & 0xFF)

	return net.IPv4(bytes[3], bytes[2], bytes[1], bytes[0])
}
