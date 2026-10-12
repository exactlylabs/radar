package netmap

import (
	"net"
	"strconv"
)

// legacyNetMap is the original string-keyed implementation (allocating a string per
// prefix length per lookup). It is kept only to prove that Map returns identical results.
type legacyNetMap struct {
	data map[string]interface{}
}

func newLegacyNetMap() *legacyNetMap {
	return &legacyNetMap{
		data: make(map[string]interface{}),
	}
}

func (m *legacyNetMap) Add(network *net.IPNet, value interface{}) {
	m.data[network.String()] = value
}

func (m *legacyNetMap) Lookup(ip net.IP) interface{} {
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
