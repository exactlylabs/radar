//go:build darwin

package netroute

import (
	"bufio"
	"bytes"
	"fmt"
	"net"
	"os/exec"
	"strings"
)

type gatewayInfo struct {
	Interface string
	Gateway   string
}

func DefaultRoute() (r Route, err error) {
	info, err := getGatewayFromSbinRoute()
	if err != nil {
		return r, fmt.Errorf("netroute.DefaultRoute getGatewayFromSbinRoute: %w", err)
	}
	iface, err := net.InterfaceByName(info.Interface)
	if err != nil {
		return r, fmt.Errorf("netroute.DefaultRoute InterfaceByName: %w", err)
	}
	gIp := net.ParseIP(info.Gateway)
	return Route{Interface: iface, GatewayIp: gIp}, nil
}

func getGatewayFromSbinRoute() (*gatewayInfo, error) {
	cmd := exec.Command("/sbin/route", "-n", "get", "0.0.0.0")
	out, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("netroute.getGatewayFromSbinRoute Output: %w", err)
	}

	// parse the output content
	scanner := bufio.NewScanner(bytes.NewReader(out))
	g := &gatewayInfo{}
	for scanner.Scan() {
		row := scanner.Text()
		fields := strings.Fields(row)
		if len(fields) < 2 {
			continue
		}
		key := strings.TrimSpace(fields[0])
		value := fields[1]
		if key == "gateway:" {
			g.Gateway = value
		} else if key == "interface:" {
			g.Interface = value
		}
	}
	return g, nil
}
