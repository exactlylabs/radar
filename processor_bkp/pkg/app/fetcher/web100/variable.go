package web100

import (
	"encoding/binary"
	"errors"
	"fmt"
	"strings"
)

// Variable is a representation of a Web100 field specifications, as they appear
// in snaplog headers.
type Variable struct {
	Name   string  // Encoded field name (before conversion to canonicalName)
	Offset int     // Offset, beyond the BEGIN_SNAP_HEADER
	Type   varType // Web100 type of the field
	Size   int     // Size, in bytes, of the raw data field.
}

// NewVariable creates a new variable based on web100 definition string
func NewVariable(s string) (*Variable, error) {
	var name string
	var length, typ, offset int
	n, err := fmt.Sscanln(s, &name, &offset, &typ, &length)

	if err != nil {
		fmt.Printf("NewVariable Error %v, %d: %s\n", err, n, s)
		return nil, err
	}
	vt := varType(typ)
	if vt > WEB100_TYPE_OCTET || vt < WEB100_TYPE_INTEGER {
		return nil, fmt.Errorf("invalid type field: %d", typ)
	}
	if length != web100Sizes[vt] {
		return nil, fmt.Errorf("invalid length for %s field: %d",
			name, length)
	}

	return &Variable{name, offset, vt, length}, nil
}

// Save interprets data according to the receiver type, and saves the result to snapValues.
// Most of the types are unused, but included here for completeness.
// This does a single alloc per int64 save???
// TODO URGENT - unit tests for this!!
func (v *Variable) Save(data []byte, snapValues Saver) error {
	// Ignore deprecated fields.
	if v.Name[0] == '_' {
		return nil
	}
	// Use the canonical variable name. The variable name known to the web100
	// kernel at run time lagged behind the official web100 spec. So, some
	// variable names need to be translated from their legacy form (read from
	// the kernel and written to the snaplog) to the canonical form (as defined
	// in tcp-kis.txt).
	canonicalName := v.Name
	if legacy, ok := CanonicalNames[canonicalName]; ok {
		canonicalName = legacy
	}
	switch v.Type {
	case WEB100_TYPE_INTEGER:
		fallthrough
	case WEB100_TYPE_INTEGER32:
		val := binary.LittleEndian.Uint32(data)
		if val >= 0x7FFFFFFF {
			snapValues.SetInt64(canonicalName, int64(val)-0x100000000)
		} else {
			snapValues.SetInt64(canonicalName, int64(val))
		}
	case WEB100_TYPE_INET_ADDRESS_IPV4:
		snapValues.SetString(canonicalName,
			fmt.Sprintf("%d.%d.%d.%d",
				data[0], data[1], data[2], data[3]))
	case WEB100_TYPE_COUNTER32:
		fallthrough
	case WEB100_TYPE_GAUGE32:
		fallthrough
	case WEB100_TYPE_UNSIGNED32:
		fallthrough
	case WEB100_TYPE_TIME_TICKS:
		snapValues.SetInt64(canonicalName, int64(binary.LittleEndian.Uint32(data)))
	case WEB100_TYPE_COUNTER64:
		// This conversion to signed may cause overflow panic!
		snapValues.SetInt64(canonicalName, int64(binary.LittleEndian.Uint64(data)))
	case WEB100_TYPE_INET_PORT_NUMBER:
		snapValues.SetInt64(canonicalName, int64(binary.LittleEndian.Uint16(data)))
	case WEB100_TYPE_INET_ADDRESS:
		fallthrough
	case WEB100_TYPE_INET_ADDRESS_IPV6:
		ip, err := IPFromBytes(data)
		if err != nil {
			return err
		}
		snapValues.SetString(canonicalName, ip.String())
	case WEB100_TYPE_STR32:
		// TODO - is there a better way?
		snapValues.SetString(canonicalName, strings.SplitN(string(data), "\000", 2)[0])
	case WEB100_TYPE_OCTET:
		// TODO - use byte array?
		snapValues.SetInt64(canonicalName, int64(data[0]))
	default:
		return errors.New("invalid field type")
	}
	return nil
}
