package web100

import (
	"errors"
	"net"
)

// IPFromBytes handles the 17 byte web100 IP address fields.
func IPFromBytes(data []byte) (net.IP, error) {
	if len(data) != 17 {
		return net.IP{}, errors.New("wrong number of bytes")
	}
	switch addrType(data[16]) {
	case WEB100_ADDRTYPE_IPV4:
		return net.IPv4(data[0], data[1], data[2], data[3]), nil
	case WEB100_ADDRTYPE_IPV6:
		return net.IP(data[:16]), nil
	case WEB100_ADDRTYPE_UNKNOWN:
		fallthrough
	default:
		return nil, errors.New("invalid IP encoding")
	}
}
