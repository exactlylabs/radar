// Package netmap maps IP networks to values with longest-prefix-match lookups.
//
// Networks are kept per prefix length in sorted integer slices (4 bytes per IPv4 key,
// 16 per IPv6 key, plus a 4-byte value index), and a lookup walks the populated prefix
// lengths from longest to shortest with a binary search each. Lookups allocate nothing.
//
// The semantics are exactly those of the original string-keyed implementation (see
// legacy_test.go): an address whose To4() is non-nil is matched only against networks
// whose String() form is IPv4 (including IPv4-mapped IPv6 networks of /96 and longer,
// which net.IPNet prints as IPv4), any other 16-byte address only against IPv6
// networks, prefix length 0 never matches, and adding the same network twice keeps the
// last value.
package netmap

import (
	"encoding/binary"
	"net"
	"sort"
	"sync"
)

type key6 struct{ hi, lo uint64 }

type table4 struct {
	keys []uint32
	vals []int32
}

type table6 struct {
	keys []key6
	vals []int32
}

// Map is a longest-prefix-match table. Add all networks first; the first Lookup (or an
// explicit Build) freezes the table, after which it is safe for concurrent lookups.
type Map[V any] struct {
	vals []V
	v4   [33]table4
	v6   [129]table6
	// populated prefix lengths, longest first
	lens4 []int
	lens6 []int
	once  sync.Once
	built bool
}

// New returns an empty Map.
func New[V any]() *Map[V] {
	return &Map[V]{}
}

// Len returns the number of values added (including ones later overwritten).
func (m *Map[V]) Len() int { return len(m.vals) }

// Add maps network to value. Networks that the original implementation could never
// match (non-canonical masks, host bits set, mismatched lengths) are ignored.
func (m *Map[V]) Add(network *net.IPNet, value V) {
	if m.built {
		panic("netmap: Add after Build")
	}
	if network == nil {
		return
	}
	ip, mask := networkNumberAndMask(network)
	if ip == nil {
		return
	}
	ones, bits := mask.Size()
	if bits == 0 || ones == 0 || bits != len(ip)*8 {
		return
	}
	if !ip.Equal(ip.Mask(mask)) {
		return
	}
	idx := int32(len(m.vals))
	m.vals = append(m.vals, value)
	if len(ip) == net.IPv4len {
		t := &m.v4[ones]
		t.keys = append(t.keys, binary.BigEndian.Uint32(ip))
		t.vals = append(t.vals, idx)
	} else {
		t := &m.v6[ones]
		t.keys = append(t.keys, key6{binary.BigEndian.Uint64(ip[:8]), binary.BigEndian.Uint64(ip[8:])})
		t.vals = append(t.vals, idx)
	}
}

// networkNumberAndMask mirrors the unexported helper net.IPNet.String uses, so that
// a network lands in the same family the old string key placed it in.
func networkNumberAndMask(n *net.IPNet) (net.IP, net.IPMask) {
	ip := n.IP.To4()
	if ip == nil {
		ip = n.IP
		if len(ip) != net.IPv6len {
			return nil, nil
		}
	}
	m := n.Mask
	switch len(m) {
	case net.IPv4len:
		if len(ip) != net.IPv4len {
			return nil, nil
		}
	case net.IPv6len:
		if len(ip) == net.IPv4len {
			m = m[12:]
		}
	default:
		return nil, nil
	}
	return ip, m
}

// Build sorts the tables. It is called automatically by the first Lookup.
func (m *Map[V]) Build() {
	m.once.Do(func() {
		for l := 32; l >= 1; l-- {
			t := &m.v4[l]
			if len(t.keys) == 0 {
				continue
			}
			sortDedup4(t)
			m.lens4 = append(m.lens4, l)
		}
		for l := 128; l >= 1; l-- {
			t := &m.v6[l]
			if len(t.keys) == 0 {
				continue
			}
			sortDedup6(t)
			m.lens6 = append(m.lens6, l)
		}
		m.built = true
	})
}

type sorter4 struct{ t *table4 }

func (s sorter4) Len() int { return len(s.t.keys) }
func (s sorter4) Less(i, j int) bool {
	if s.t.keys[i] != s.t.keys[j] {
		return s.t.keys[i] < s.t.keys[j]
	}
	return s.t.vals[i] < s.t.vals[j]
}
func (s sorter4) Swap(i, j int) {
	s.t.keys[i], s.t.keys[j] = s.t.keys[j], s.t.keys[i]
	s.t.vals[i], s.t.vals[j] = s.t.vals[j], s.t.vals[i]
}

func sortDedup4(t *table4) {
	s := sorter4{t}
	if !sort.IsSorted(s) {
		sort.Sort(s)
	}
	// equal keys are ordered by insertion; keep the last one (map overwrite semantics)
	out := 0
	for i := range t.keys {
		if out > 0 && t.keys[out-1] == t.keys[i] {
			t.vals[out-1] = t.vals[i]
			continue
		}
		t.keys[out], t.vals[out] = t.keys[i], t.vals[i]
		out++
	}
	t.keys = append([]uint32(nil), t.keys[:out]...)
	t.vals = append([]int32(nil), t.vals[:out]...)
}

func less6(a, b key6) bool {
	if a.hi != b.hi {
		return a.hi < b.hi
	}
	return a.lo < b.lo
}

type sorter6 struct{ t *table6 }

func (s sorter6) Len() int { return len(s.t.keys) }
func (s sorter6) Less(i, j int) bool {
	if s.t.keys[i] != s.t.keys[j] {
		return less6(s.t.keys[i], s.t.keys[j])
	}
	return s.t.vals[i] < s.t.vals[j]
}
func (s sorter6) Swap(i, j int) {
	s.t.keys[i], s.t.keys[j] = s.t.keys[j], s.t.keys[i]
	s.t.vals[i], s.t.vals[j] = s.t.vals[j], s.t.vals[i]
}

func sortDedup6(t *table6) {
	s := sorter6{t}
	if !sort.IsSorted(s) {
		sort.Sort(s)
	}
	out := 0
	for i := range t.keys {
		if out > 0 && t.keys[out-1] == t.keys[i] {
			t.vals[out-1] = t.vals[i]
			continue
		}
		t.keys[out], t.vals[out] = t.keys[i], t.vals[i]
		out++
	}
	t.keys = append([]key6(nil), t.keys[:out]...)
	t.vals = append([]int32(nil), t.vals[:out]...)
}

func mask4(l int) uint32 {
	return ^uint32(0) << (32 - l)
}

func mask6(k key6, l int) key6 {
	switch {
	case l >= 128:
		return k
	case l > 64:
		return key6{k.hi, k.lo & (^uint64(0) << (128 - l))}
	case l == 64:
		return key6{k.hi, 0}
	default:
		return key6{k.hi & (^uint64(0) << (64 - l)), 0}
	}
}

// Lookup returns the value of the longest matching network.
func (m *Map[V]) Lookup(ip net.IP) (V, bool) {
	m.Build()
	var zero V
	if ip4 := ip.To4(); ip4 != nil {
		addr := binary.BigEndian.Uint32(ip4)
		for _, l := range m.lens4 {
			t := &m.v4[l]
			k := addr & mask4(l)
			i := sort.Search(len(t.keys), func(i int) bool { return t.keys[i] >= k })
			if i < len(t.keys) && t.keys[i] == k {
				return m.vals[t.vals[i]], true
			}
		}
		return zero, false
	}
	if len(ip) != net.IPv6len {
		return zero, false
	}
	addr := key6{binary.BigEndian.Uint64(ip[:8]), binary.BigEndian.Uint64(ip[8:])}
	for _, l := range m.lens6 {
		t := &m.v6[l]
		k := mask6(addr, l)
		i := sort.Search(len(t.keys), func(i int) bool { return !less6(t.keys[i], k) })
		if i < len(t.keys) && t.keys[i] == k {
			return m.vals[t.vals[i]], true
		}
	}
	return zero, false
}
