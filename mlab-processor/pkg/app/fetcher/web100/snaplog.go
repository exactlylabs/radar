package web100

import (
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"net"
	"strings"
)

// connectionSpec holds the 4-tuple info from the header, and may be used to
// populate the connection_spec field of the web100_log_entry.  It does not support
// ipv6, so it is of limited use.
type connectionSpec struct {
	DestPort uint16
	SrcPort  uint16
	DestAddr []byte // 4 byte IP address.  0.0.0.0 for ipv6
	SrcAddr  []byte
}

// SnapLog encapsulates the raw data and all elements of the header.
type SnapLog struct {
	// The entire raw contents of the file.  Generally 1.5MB, but may be much larger
	raw []byte

	Version   string
	LogTime   uint32
	GroupName string

	connSpecOffset int // Offset in bytes of the ConnSpec
	bodyOffset     int // Offset in bytes of the first snapshot
	spec           fieldSet
	// The primary field set used by snapshots
	// The name "read" is ugly, but that is the name of the web100 header section.
	read fieldSet
	tune fieldSet

	// Use with caution.  Generally should use connection spec from .meta file or
	// from snapshot instead.
	connSpec connectionSpec
}

// NewSnapLog creates a SnapLog from a byte array.  Returns error if there are problems.
func NewSnapLog(raw []byte) (*SnapLog, error) {
	buf := bytes.NewBuffer(raw)

	// First, the version, etc.
	version, err := buf.ReadString('\n')
	if err != nil {
		return nil, err
	}
	version = strings.Split(version, "\n")[0]

	// Empty line
	empty, err := buf.ReadString('\n')
	if err != nil {
		return nil, err
	}
	if empty != "\n" {
		return nil, errors.New("expected empty string")
	}

	// TODO - do these header elements always come in this order.
	spec, err := parseFields(buf, "/spec\n", "\n")
	if err != nil {
		return nil, err
	}

	// Lots of allocation here.
	// TODO - could improve alloc efficiency here.
	read, err := parseFields(buf, "/read\n", "\n")
	if err != nil {
		return nil, err
	}
	read.Length += len(BEGIN_SNAP_DATA)

	// The terminator here does NOT start with \n.  8-(
	tune, err := parseFields(buf, "/tune\n", END_OF_HEADER)
	if err != nil {
		return nil, err
	}

	// Read the timestamp.
	t := make([]byte, 4)
	n, err := buf.Read(t)
	if err != nil || n < 4 {
		return nil, errors.New("too few bytes for logTime")
	}
	logTime := binary.LittleEndian.Uint32(t)

	// Read the group name.
	// The web100 group is a set of web100 variables from a specific agent.
	// M-Lab snaplogs only ever have a single agent ("local") and group.
	// The group is typically "read", but the header typically also includes
	// "spec" and "tune".
	gn := make([]byte, GROUPNAME_LEN_MAX)
	n, err = buf.Read(gn)
	if err != nil || n != GROUPNAME_LEN_MAX {
		return nil, errors.New("too few bytes for groupName")
	}
	// The groupname is a C char*, terminated with a null character.
	groupName := strings.SplitN(string(gn), "\000", 2)[0]
	if groupName != "read" {
		return nil, errors.New("only 'read' group is supported")
	}

	connSpecOffset := len(raw) - buf.Len()
	connSpec, err := parseConnectionSpec(buf)
	if err != nil {
		return nil, err
	}

	bodyOffset := len(raw) - buf.Len()

	slog := SnapLog{raw: raw, Version: version, LogTime: logTime, GroupName: groupName,
		connSpecOffset: connSpecOffset, bodyOffset: bodyOffset,
		spec: *spec, read: *read, tune: *tune, connSpec: connSpec}

	return &slog, nil
}

func (sl *SnapLog) ConnectionSpecValues(saver Saver) {
	saver.SetInt64("local_af", int64(0))
	src := sl.connSpec.SrcAddr
	saver.SetString("local_ip", net.IPv4(src[0], src[1], src[2], src[3]).String())
	saver.SetInt64("local_port", int64(sl.connSpec.SrcPort))
	dst := sl.connSpec.DestAddr
	saver.SetString("remote_ip", net.IPv4(dst[0], dst[1], dst[2], dst[3]).String())
	saver.SetInt64("remote_port", int64(sl.connSpec.DestPort))
}

// SnapshotNumBytes returns the length of snapshot records, including preamble.
// Used only for testing.
func (sl *SnapLog) SnapshotNumBytes() int {
	return sl.read.Length
}

// SnapshotNumFields returns the total number of snapshot fields.
// Used only for testing.
func (sl *SnapLog) SnapshotNumFields() int {
	return len(sl.read.Fields)
}

// SnapCount returns the number of valid snapshots.
func (sl *SnapLog) SnapCount() int {
	total := len(sl.raw) - sl.bodyOffset
	return total / sl.read.Length
}

// ValidateSnapshots checks whether the first and last snapshots are valid and complete.
func (sl *SnapLog) ValidateSnapshots() error {
	// Valid first snapshot?
	_, err := sl.Snapshot(0)
	if err != nil {
		return err
	}
	// Valid last snapshot?
	_, err = sl.Snapshot(sl.SnapCount() - 1)
	if err != nil {
		return err
	}
	// Verify that body size is integer multiple of body record length.
	total := len(sl.raw) - sl.bodyOffset
	if total%sl.read.Length != 0 {
		return errors.New("last snapshot truncated")
	}
	return nil
}

// Snapshot returns the snapshot at index n, or error if n is not a valid index, or data is corrupted.
func (sl *SnapLog) Snapshot(n int) (Snapshot, error) {
	if n > sl.SnapCount()-1 {
		return Snapshot{}, fmt.Errorf("invalid snapshot index %d", n)
	}
	offset := sl.bodyOffset + n*sl.read.Length
	begin := string(sl.raw[offset : offset+len(BEGIN_SNAP_DATA)])
	if begin != BEGIN_SNAP_DATA {
		return Snapshot{}, errors.New("missing BeginSnapData")
	}

	// We use the "/read" field group, as that is what is always used for NDT snapshots.
	// This may be incorrect for use in other settings.
	return Snapshot{raw: sl.raw[offset+len(BEGIN_SNAP_DATA) : offset+sl.read.Length],
		fields: &sl.read}, nil
}

// ChangeIndices finds all snapshot indices where the specified field
// changes value.
func (sl *SnapLog) ChangeIndices(fieldName string) ([]int, error) {
	result := make([]int, 0, 100)
	field := sl.read.find(fieldName)
	if field == nil {
		return nil, errors.New("field not found")
	}
	last := make([]byte, field.Size)
	var s Snapshot // This saves about 2 usec, compared with creating new Snapshot for each row.
	for i := 0; i < sl.SnapCount(); i++ {
		// This saves about 30 usec
		offset := sl.bodyOffset + i*sl.read.Length
		begin := string(sl.raw[offset : offset+len(BEGIN_SNAP_DATA)])
		if begin != BEGIN_SNAP_DATA {
			return nil, nil
		}
		s.reset(sl.raw[offset+len(BEGIN_SNAP_DATA):offset+sl.read.Length], &sl.read)

		data := s.raw[field.Offset : field.Offset+field.Size]
		if !bytes.Equal(data, last) {
			result = append(result, i)
		}
		last = data
	}
	return result, nil
}

// parseFields parses the newline separated web100 variable types from the header.
func parseFields(buf *bytes.Buffer, preamble string, terminator string) (*fieldSet, error) {
	fields := new(fieldSet)
	fields.FieldMap = make(map[string]int)

	pre, err := buf.ReadString('\n')
	if err != nil {
		return nil, err
	}
	if pre != preamble {
		return nil, errors.New("Expected preamble: " +
			// Strip terminal \n from each string for readability.
			preamble[:len(preamble)-1] + " != " + pre[:len(pre)-1])
	}

	for {
		line, err := buf.ReadString('\n')
		// line length is max var name size, plus 20 bytes for the 3 numeric fields.
		if err != nil || len(line) > VARNAME_LEN_MAX+20 {
			if err == io.EOF {
				return nil, errors.New("encountered EOF")
			}
			return nil, errors.New("corrupted header")
		}
		if line == terminator {
			return fields, nil
		}
		v, err := NewVariable(line)
		if err != nil {
			return nil, err
		}
		if fields.Length != v.Offset {
			return nil, errors.New("Bad offset at " + line[:len(line)-2])
		}
		fields.FieldMap[v.Name] = len(fields.Fields)
		fields.Fields = append(fields.Fields, *v)
		fields.Length += v.Size
	}
}

// parseConnectionSpec parses the 16 byte binary connection spec field from the header.
func parseConnectionSpec(buf *bytes.Buffer) (connectionSpec, error) {
	// The web100 snaplog only correctly represents ipv4 addresses.
	// If the later parts of the log are corrupt, this may be all we get,
	// so for now, read it anyway.
	raw := make([]byte, 16)
	n, err := buf.Read(raw)
	if err != nil || n < 16 {
		return connectionSpec{}, errors.New("too few bytes for connection spec")
	}
	// WARNING - the web100 code seemingly depends on a 32 bit architecture.
	// There is no "packed" directive for the web100_connection_spec, and the
	// fields all seem to be 32 bit aligned.
	dstPort := binary.LittleEndian.Uint16(raw[0:2])
	dstAddr := raw[4:8]
	srcPort := binary.LittleEndian.Uint16(raw[8:10])
	srcAddr := raw[12:16]

	return connectionSpec{DestPort: dstPort, SrcPort: srcPort,
		DestAddr: dstAddr, SrcAddr: srcAddr}, nil
}
