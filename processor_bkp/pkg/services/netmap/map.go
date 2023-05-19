package netmap

import (
	"net"
	"strconv"
)

type NetMap struct {
	data map[string]interface{}
}

func NewNetMap() *NetMap {
	return &NetMap{
		data: make(map[string]interface{}),
	}
}

func (m *NetMap) Add(network *net.IPNet, value interface{}) {
	m.data[network.String()] = value
}

func (m *NetMap) Lookup(ip net.IP) interface{} {
	var bitLength int
	if ip.To4() == nil {
		bitLength = 128
	} else {
		bitLength = 32
	}

	for i := bitLength; i > 0; i -= 1 {
		mask := net.CIDRMask(i, bitLength)
		lookupNetwork := ip.Mask(mask).String() + "/" + strconv.Itoa(i)

		value, ok := m.data[lookupNetwork]
		if ok {
			return value
		}
	}

	return nil
}
