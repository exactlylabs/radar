//go:build linux

package netroute

import (
	"bufio"
	"encoding/binary"
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"
)

type gatewayInfo struct {
	Interface string
	Gateway   net.IP
}

func DefaultRoute() (r Route, err error) {
	info, err := getGatewayFromNetRoute()
	if err != nil {
		return r, fmt.Errorf("netroute.DefaultRoute getGatewayFromNetRoute: %w", err)
	}
	iface, err := net.InterfaceByName(info.Interface)
	if err != nil {
		return r, fmt.Errorf("netroute.DefaultRoute InterfaceByName: %w", err)
	}
	return Route{Interface: iface, GatewayIp: info.Gateway}, nil
}

func getGatewayFromNetRoute() (*gatewayInfo, error) {
	f, err := os.Open("/proc/net/route")
	if err != nil {
		return nil, fmt.Errorf("netroute.getGatewayFromNetRoute Open: %w", err)
	}
	defer f.Close()
	scanner := bufio.NewScanner(f)
	headers := make(map[string]int)
	if !scanner.Scan() {
		return nil, fmt.Errorf("netroute.getGatewayFromNetRoute Scan: %w", scanner.Err())
	}
	// Populate Headers
	columns := strings.Split(scanner.Text(), "\t")
	for i, c := range columns {
		headers[strings.TrimSpace(c)] = i
	}
	for scanner.Scan() {
		columns := strings.Split(scanner.Text(), "\t")
		gatewayAddr, err := strconv.ParseInt("0x"+columns[headers["Gateway"]], 0, 64)
		if err != nil {
			return nil, fmt.Errorf("netroute.getGatewayFromNetRoute ParseInt: %w", err)
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
	return nil, fmt.Errorf("netroute.getGatewayFromNetRoute: gateway not found")
}

func inet_ntoa(ipnr int64) net.IP {
	var bytes [4]byte
	bytes[0] = byte(ipnr & 0xFF)
	bytes[1] = byte((ipnr >> 8) & 0xFF)
	bytes[2] = byte((ipnr >> 16) & 0xFF)
	bytes[3] = byte((ipnr >> 24) & 0xFF)

	return net.IPv4(bytes[3], bytes[2], bytes[1], bytes[0])
}
