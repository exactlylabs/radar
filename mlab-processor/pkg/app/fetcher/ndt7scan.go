package fetcher

// A targeted extractor for ndt7 archival records (ndt7.NDT7Result as written by
// ndt-server). The fetcher uses a handful of fields: ClientIP, and for Download/Upload the
// UUID, StartTime, the TCPInfo of the last ServerMeasurements element and whether the
// ClientMetadata carries an access token. A record is ~30 KB of JSON, almost all of it
// the measurement arrays, so decoding it with encoding/json (even into a lean struct) was
// about half of the fetch CPU. This scanner walks the document once, skips every value it
// does not need structurally (brackets, strings, literals: no field decoding), and decodes
// the used fields with the same semantics as encoding/json: field names match
// case-insensitively, the last duplicate wins, null leaves strings/numbers unchanged and
// nils pointers, numbers must be integers of the field's width (otherwise the file is bad,
// as a json.UnmarshalTypeError made it before), strings with escapes or non-ASCII bytes go
// through json.Unmarshal, times through time.Time.UnmarshalJSON.
//
// What it deliberately does not replicate: type errors in values that are skipped (an
// AppInfo field holding a string, say) made encoding/json reject the file; here they are
// skipped like any other value. Syntax errors are still rejected everywhere.

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"time"
)

type ndt7TCP struct {
	BytesAcked, BytesReceived, BytesSent, BytesRetrans, ElapsedTime int64
	MinRTT                                                          uint32
}

type ndt7Side struct {
	UUID      string
	StartTime time.Time
	// Measurements is len(ServerMeasurements); TCP the TCPInfo of its last element.
	Measurements   int
	TCP            *ndt7TCP
	HasAccessToken bool
	tcp            ndt7TCP
}

type ndt7Record struct {
	ClientIP string
	Download *ndt7Side
	Upload   *ndt7Side
	down, up ndt7Side
}

type jsonScanner struct {
	b []byte
	i int
}

func (s *jsonScanner) errorf(format string, args ...any) error {
	return fmt.Errorf("ndt7 json offset %d: %s", s.i, fmt.Sprintf(format, args...))
}

func (s *jsonScanner) ws() {
	if s.i < len(s.b) && s.b[s.i] > ' ' { // the common case: Marshal output has no whitespace
		return
	}
	for s.i < len(s.b) {
		switch s.b[s.i] {
		case ' ', '\t', '\n', '\r':
			s.i++
		default:
			return
		}
	}
}

func (s *jsonScanner) peek() byte {
	if s.i < len(s.b) {
		return s.b[s.i]
	}
	return 0
}

func (s *jsonScanner) expect(c byte) error {
	s.ws()
	if s.i >= len(s.b) || s.b[s.i] != c {
		return s.errorf("expected %q", c)
	}
	s.i++
	return nil
}

func (s *jsonScanner) literal(lit string) error {
	if len(s.b)-s.i < len(lit) || string(s.b[s.i:s.i+len(lit)]) != lit {
		return s.errorf("invalid literal")
	}
	s.i += len(lit)
	return nil
}

// isNull consumes a null literal if one is next.
func (s *jsonScanner) isNull() (bool, error) {
	s.ws()
	if s.peek() != 'n' {
		return false, nil
	}
	return true, s.literal("null")
}

// rawString scans the quoted string at s.i and returns it with its quotes. plain is
// true when it holds neither escapes nor bytes >= 0x80, so its content is the string.
func (s *jsonScanner) rawString() (raw []byte, plain bool, err error) {
	if s.peek() != '"' {
		return nil, false, s.errorf("expected string")
	}
	start := s.i
	i := s.i + 1
	plain = true
	b := s.b
	for {
		for i < len(b) && stringClass[b[i]] == 0 {
			i++
		}
		if i >= len(b) {
			s.i = i
			return nil, false, s.errorf("unterminated string")
		}
		switch c := b[i]; {
		case c == '"':
			s.i = i + 1
			return b[start:s.i], plain, nil
		case c == '\\':
			plain = false
			i += 2
		case c < 0x20:
			s.i = i
			return nil, false, s.errorf("control character in string")
		default: // >= 0x80
			plain = false
			i++
		}
	}
}

// stringClass marks the bytes that end the plain run of a string: the quote, the
// backslash, control characters and non-ASCII bytes.
var stringClass = func() (t [256]uint8) {
	for c := 0; c < 0x20; c++ {
		t[c] = 1
	}
	for c := 0x80; c < 0x100; c++ {
		t[c] = 1
	}
	t['"'], t['\\'] = 1, 1
	return
}()

// strBytes returns the content of the next string. The result aliases the input or a
// fresh buffer; copy it to keep it.
func (s *jsonScanner) strBytes() ([]byte, error) {
	raw, plain, err := s.rawString()
	if err != nil {
		return nil, err
	}
	if plain {
		return raw[1 : len(raw)-1], nil
	}
	var out string
	if err := json.Unmarshal(raw, &out); err != nil {
		return nil, s.errorf("%v", err)
	}
	return []byte(out), nil
}

// strField decodes a string value into dst (null leaves it unchanged).
func (s *jsonScanner) strField(dst *string) error {
	if null, err := s.isNull(); null || err != nil {
		return err
	}
	raw, plain, err := s.rawString()
	if err != nil {
		return err
	}
	if plain {
		*dst = string(raw[1 : len(raw)-1])
		return nil
	}
	if err := json.Unmarshal(raw, dst); err != nil {
		return s.errorf("%v", err)
	}
	return nil
}

// timeField decodes an RFC 3339 string into dst like time.Time.UnmarshalJSON.
func (s *jsonScanner) timeField(dst *time.Time) error {
	if null, err := s.isNull(); null || err != nil {
		return err
	}
	raw, _, err := s.rawString()
	if err != nil {
		return err
	}
	if err := dst.UnmarshalJSON(raw); err != nil {
		return s.errorf("%v", err)
	}
	return nil
}

// number scans a JSON number and returns its text.
func (s *jsonScanner) number() ([]byte, error) {
	b := s.b
	start := s.i
	i := s.i
	if i < len(b) && b[i] == '-' {
		i++
	}
	if i < len(b) && b[i] == '0' {
		i++
	} else {
		j := i
		for i < len(b) && b[i] >= '0' && b[i] <= '9' {
			i++
		}
		if i == j {
			return nil, s.errorf("invalid number")
		}
	}
	if i < len(b) && b[i] == '.' {
		i++
		j := i
		for i < len(b) && b[i] >= '0' && b[i] <= '9' {
			i++
		}
		if i == j {
			return nil, s.errorf("invalid number")
		}
	}
	if i < len(b) && (b[i] == 'e' || b[i] == 'E') {
		i++
		if i < len(b) && (b[i] == '+' || b[i] == '-') {
			i++
		}
		j := i
		for i < len(b) && b[i] >= '0' && b[i] <= '9' {
			i++
		}
		if i == j {
			return nil, s.errorf("invalid number")
		}
	}
	s.i = i
	return b[start:i], nil
}

func (s *jsonScanner) int64Field(dst *int64) error {
	if null, err := s.isNull(); null || err != nil {
		return err
	}
	if s.peek() == '"' || !(s.peek() == '-' || (s.peek() >= '0' && s.peek() <= '9')) {
		return s.errorf("cannot unmarshal into int64")
	}
	txt, err := s.number()
	if err != nil {
		return err
	}
	v, err := strconv.ParseInt(string(txt), 10, 64)
	if err != nil {
		return s.errorf("cannot unmarshal number %s into int64", txt)
	}
	*dst = v
	return nil
}

func (s *jsonScanner) uint32Field(dst *uint32) error {
	if null, err := s.isNull(); null || err != nil {
		return err
	}
	if !(s.peek() >= '0' && s.peek() <= '9') {
		return s.errorf("cannot unmarshal into uint32")
	}
	txt, err := s.number()
	if err != nil {
		return err
	}
	v, err := strconv.ParseUint(string(txt), 10, 32)
	if err != nil {
		return s.errorf("cannot unmarshal number %s into uint32", txt)
	}
	*dst = uint32(v)
	return nil
}

// skipValue consumes one value of any type, checking only its syntax.
func (s *jsonScanner) skipValue() error {
	s.ws()
	if s.i >= len(s.b) {
		return s.errorf("unexpected end of input")
	}
	switch c := s.b[s.i]; {
	case c == '"':
		_, _, err := s.rawString()
		return err
	case c == '{':
		return s.skipObject()
	case c == '[':
		return s.skipArray()
	case c == 't':
		return s.literal("true")
	case c == 'f':
		return s.literal("false")
	case c == 'n':
		return s.literal("null")
	case c == '-' || (c >= '0' && c <= '9'):
		_, err := s.number()
		return err
	default:
		return s.errorf("unexpected character %q", c)
	}
}

// skipObject is object(skipValue) without the per-member indirect call.
func (s *jsonScanner) skipObject() error {
	s.i++ // '{'
	s.ws()
	if s.peek() == '}' {
		s.i++
		return nil
	}
	for {
		s.ws()
		if _, _, err := s.rawString(); err != nil {
			return err
		}
		if err := s.expect(':'); err != nil {
			return err
		}
		if err := s.skipValue(); err != nil {
			return err
		}
		s.ws()
		switch s.peek() {
		case ',':
			s.i++
		case '}':
			s.i++
			return nil
		default:
			return s.errorf("expected ',' or '}'")
		}
	}
}

// skipArray is array(skipValue) without the per-element indirect call.
func (s *jsonScanner) skipArray() error {
	s.i++ // '['
	s.ws()
	if s.peek() == ']' {
		s.i++
		return nil
	}
	for {
		if err := s.skipValue(); err != nil {
			return err
		}
		s.ws()
		switch s.peek() {
		case ',':
			s.i++
		case ']':
			s.i++
			return nil
		default:
			return s.errorf("expected ',' or ']'")
		}
	}
}

// object walks the object at s.i calling field for every member; field must consume the
// member's value.
func (s *jsonScanner) object(field func(key []byte) error) error {
	if err := s.expect('{'); err != nil {
		return err
	}
	s.ws()
	if s.peek() == '}' {
		s.i++
		return nil
	}
	for {
		s.ws()
		k, err := s.strBytes()
		if err != nil {
			return err
		}
		if err := s.expect(':'); err != nil {
			return err
		}
		s.ws()
		if err := field(k); err != nil {
			return err
		}
		s.ws()
		switch s.peek() {
		case ',':
			s.i++
		case '}':
			s.i++
			return nil
		default:
			return s.errorf("expected ',' or '}'")
		}
	}
}

// array walks the array at s.i calling elem for every element; elem must consume it.
func (s *jsonScanner) array(elem func() error) error {
	if err := s.expect('['); err != nil {
		return err
	}
	s.ws()
	if s.peek() == ']' {
		s.i++
		return nil
	}
	for {
		s.ws()
		if err := elem(); err != nil {
			return err
		}
		s.ws()
		switch s.peek() {
		case ',':
			s.i++
		case ']':
			s.i++
			return nil
		default:
			return s.errorf("expected ',' or ']'")
		}
	}
}

// keyIs is encoding/json's field matching: exact or case-folded.
func keyIs(key []byte, name string) bool {
	if len(key) != len(name) {
		return false
	}
	for i := 0; i < len(key); i++ {
		a, b := key[i], name[i]
		if a == b {
			continue
		}
		if a >= 0x80 || b >= 0x80 {
			return bytes.EqualFold(key, []byte(name))
		}
		if a|0x20 != b|0x20 || (a|0x20) < 'a' || (a|0x20) > 'z' {
			return false
		}
	}
	return true
}

// parseNdt7 fills rec from the JSON document b. A null document leaves rec empty.
func parseNdt7(b []byte, rec *ndt7Record) error {
	*rec = ndt7Record{}
	s := jsonScanner{b: b}
	s.ws()
	if s.i >= len(b) {
		return s.errorf("empty document")
	}
	if null, err := s.isNull(); null || err != nil {
		return err
	}
	return s.object(func(k []byte) error {
		switch {
		case keyIs(k, "ClientIP"):
			return s.strField(&rec.ClientIP)
		case keyIs(k, "Download"):
			return s.side(&rec.Download, &rec.down)
		case keyIs(k, "Upload"):
			return s.side(&rec.Upload, &rec.up)
		default:
			return s.skipValue()
		}
	})
}

// side decodes an ArchivalData object into *ptr (storage st), reusing a non-nil *ptr
// like encoding/json does.
func (s *jsonScanner) side(ptr **ndt7Side, st *ndt7Side) error {
	if null, err := s.isNull(); null || err != nil {
		*ptr = nil
		return err
	}
	if *ptr == nil {
		*st = ndt7Side{}
		*ptr = st
	}
	side := *ptr
	return s.object(func(k []byte) error {
		switch {
		case keyIs(k, "UUID"):
			return s.strField(&side.UUID)
		case keyIs(k, "StartTime"):
			return s.timeField(&side.StartTime)
		case keyIs(k, "ServerMeasurements"):
			return s.measurements(side)
		case keyIs(k, "ClientMetadata"):
			return s.clientMetadata(side)
		default:
			return s.skipValue()
		}
	})
}

// measurements counts the ServerMeasurements elements, skipping all but the last, whose
// TCPInfo is decoded.
func (s *jsonScanner) measurements(side *ndt7Side) error {
	side.Measurements, side.TCP = 0, nil
	if null, err := s.isNull(); null || err != nil {
		return err
	}
	lastStart, lastEnd := 0, 0
	err := s.array(func() error {
		lastStart = s.i
		if err := s.skipValue(); err != nil {
			return err
		}
		lastEnd = s.i
		side.Measurements++
		return nil
	})
	if err != nil || side.Measurements == 0 {
		return err
	}
	sub := jsonScanner{b: s.b[:lastEnd], i: lastStart}
	if null, err := sub.isNull(); null || err != nil {
		return err
	}
	return sub.object(func(k []byte) error {
		if keyIs(k, "TCPInfo") {
			return sub.tcpInfo(side)
		}
		return sub.skipValue()
	})
}

func (s *jsonScanner) tcpInfo(side *ndt7Side) error {
	if null, err := s.isNull(); null || err != nil {
		side.TCP = nil
		return err
	}
	if side.TCP == nil {
		side.tcp = ndt7TCP{}
		side.TCP = &side.tcp
	}
	tcp := side.TCP
	return s.object(func(k []byte) error {
		switch {
		case keyIs(k, "BytesAcked"):
			return s.int64Field(&tcp.BytesAcked)
		case keyIs(k, "BytesReceived"):
			return s.int64Field(&tcp.BytesReceived)
		case keyIs(k, "BytesSent"):
			return s.int64Field(&tcp.BytesSent)
		case keyIs(k, "BytesRetrans"):
			return s.int64Field(&tcp.BytesRetrans)
		case keyIs(k, "ElapsedTime"):
			return s.int64Field(&tcp.ElapsedTime)
		case keyIs(k, "MinRTT"):
			return s.uint32Field(&tcp.MinRTT)
		default:
			return s.skipValue()
		}
	})
}

// clientMetadata sets HasAccessToken the way accessSigFromClientMetadata reads a decoded
// []ndt.NameValue: the first "access_token" entry decides, and its value must have three
// dot-separated parts.
func (s *jsonScanner) clientMetadata(side *ndt7Side) error {
	side.HasAccessToken = false
	if null, err := s.isNull(); null || err != nil {
		return err
	}
	found := false
	return s.array(func() error {
		if null, err := s.isNull(); null || err != nil {
			return err
		}
		var name, value []byte
		err := s.object(func(k []byte) error {
			switch {
			case keyIs(k, "Name"):
				if null, err := s.isNull(); null || err != nil {
					return err
				}
				v, err := s.strBytes()
				name = v
				return err
			case keyIs(k, "Value"):
				if null, err := s.isNull(); null || err != nil {
					return err
				}
				v, err := s.strBytes()
				value = v
				return err
			default:
				return s.skipValue()
			}
		})
		if err != nil {
			return err
		}
		if !found && string(name) == "access_token" {
			found = true
			side.HasAccessToken = bytes.Count(value, []byte(".")) == 2
		}
		return nil
	})
}
