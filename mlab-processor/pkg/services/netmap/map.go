// Package netmap maps IP networks to values with longest-prefix-match lookups.
//
// Build flattens the networks into a sorted table of disjoint address intervals, each
// labelled with the value of the longest network covering it (nested networks split
// their parent's interval). A lookup is one binary search in the interval table, narrowed
// by a first-level index on the top 20 bits of the address (4 MB per family), so it
// touches a couple of cache lines and allocates nothing.
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
	"net/netip"
	"sort"
	"sync"
)

type key6 struct{ hi, lo uint64 }

func less6(a, b key6) bool {
	if a.hi != b.hi {
		return a.hi < b.hi
	}
	return a.lo < b.lo
}

type net4 struct {
	start uint32
	ones  uint8
	idx   int32
}

type net6 struct {
	start key6
	ones  uint8
	idx   int32
}

const (
	top4Bits = 20
	top6Bits = 20
)

// Map is a longest-prefix-match table. Add all networks first; the first Lookup (or an
// explicit Build) freezes the table, after which it is safe for concurrent lookups.
type Map[V any] struct {
	vals  []V
	nets4 []net4
	nets6 []net6

	// interval tables: an address a maps to the value of the last boundary with
	// start <= a; a value index < 0 means "no network".
	b4Start []uint32
	b4Val   []int32
	top4    []int32 // top4[t] = first boundary with start >= t<<12, len 2^20+1
	b6Start []key6
	b6Val   []int32
	top6    []int32 // top6[t] = first boundary with start.hi>>44 >= t, len 2^20+1

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
		m.nets4 = append(m.nets4, net4{start: binary.BigEndian.Uint32(ip), ones: uint8(ones), idx: idx})
	} else {
		m.nets6 = append(m.nets6, net6{
			start: key6{binary.BigEndian.Uint64(ip[:8]), binary.BigEndian.Uint64(ip[8:])},
			ones:  uint8(ones), idx: idx,
		})
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

// Build flattens the tables. It is called automatically by the first Lookup.
func (m *Map[V]) Build() {
	m.once.Do(func() {
		m.build4()
		m.build6()
		m.nets4, m.nets6 = nil, nil
		m.built = true
	})
}

// The flattening is a sweep over the networks sorted by start (parents before their
// children, insertion order among duplicates) with a stack of the open networks: a
// boundary is emitted where a network starts and where one ends (back to its parent).
// Later boundaries at the same address win, which gives both the longest-prefix and the
// last-added-duplicate rules.

func (m *Map[V]) build4() {
	nets := m.nets4
	sort.SliceStable(nets, func(i, j int) bool {
		if nets[i].start != nets[j].start {
			return nets[i].start < nets[j].start
		}
		return nets[i].ones < nets[j].ones
	})
	type open struct {
		end uint64
		idx int32
	}
	var stack []open
	starts := make([]uint64, 0, 2*len(nets))
	vals := make([]int32, 0, 2*len(nets))
	emit := func(addr uint64, val int32) {
		if n := len(starts); n > 0 && starts[n-1] == addr {
			vals[n-1] = val
			return
		}
		starts = append(starts, addr)
		vals = append(vals, val)
	}
	pop := func() {
		top := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		next := int32(-1)
		if len(stack) > 0 {
			next = stack[len(stack)-1].idx
		}
		emit(top.end+1, next)
	}
	for _, n := range nets {
		s := uint64(n.start)
		e := s | (uint64(1)<<(32-uint(n.ones)) - 1)
		for len(stack) > 0 && stack[len(stack)-1].end < s {
			pop()
		}
		stack = append(stack, open{e, n.idx})
		emit(s, n.idx)
	}
	for len(stack) > 0 {
		pop()
	}
	m.b4Start = make([]uint32, 0, len(starts))
	m.b4Val = make([]int32, 0, len(starts))
	for i, s := range starts {
		if s > 0xffffffff {
			continue
		}
		if n := len(m.b4Val); n > 0 && m.b4Val[n-1] == vals[i] {
			continue
		}
		m.b4Start = append(m.b4Start, uint32(s))
		m.b4Val = append(m.b4Val, vals[i])
	}
	m.top4 = make([]int32, (1<<top4Bits)+1)
	i := 0
	for t := 0; t <= 1<<top4Bits; t++ {
		for i < len(m.b4Start) && uint64(m.b4Start[i]) < uint64(t)<<(32-top4Bits) {
			i++
		}
		m.top4[t] = int32(i)
	}
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

// end6 is the last address of the network start/ones.
func end6(start key6, ones int) key6 {
	m := mask6(key6{^uint64(0), ^uint64(0)}, ones)
	return key6{start.hi | ^m.hi, start.lo | ^m.lo}
}

// inc6 returns k+1 and whether it did not overflow.
func inc6(k key6) (key6, bool) {
	k.lo++
	if k.lo == 0 {
		k.hi++
		if k.hi == 0 {
			return k, false
		}
	}
	return k, true
}

func (m *Map[V]) build6() {
	nets := m.nets6
	sort.SliceStable(nets, func(i, j int) bool {
		if nets[i].start != nets[j].start {
			return less6(nets[i].start, nets[j].start)
		}
		return nets[i].ones < nets[j].ones
	})
	type open struct {
		end key6
		idx int32
	}
	var stack []open
	starts := make([]key6, 0, 2*len(nets))
	vals := make([]int32, 0, 2*len(nets))
	emit := func(addr key6, val int32) {
		if n := len(starts); n > 0 && starts[n-1] == addr {
			vals[n-1] = val
			return
		}
		starts = append(starts, addr)
		vals = append(vals, val)
	}
	pop := func() {
		top := stack[len(stack)-1]
		stack = stack[:len(stack)-1]
		next := int32(-1)
		if len(stack) > 0 {
			next = stack[len(stack)-1].idx
		}
		if after, ok := inc6(top.end); ok {
			emit(after, next)
		}
	}
	for _, n := range nets {
		e := end6(n.start, int(n.ones))
		for len(stack) > 0 && less6(stack[len(stack)-1].end, n.start) {
			pop()
		}
		stack = append(stack, open{e, n.idx})
		emit(n.start, n.idx)
	}
	for len(stack) > 0 {
		pop()
	}
	m.b6Start = make([]key6, 0, len(starts))
	m.b6Val = make([]int32, 0, len(starts))
	for i, s := range starts {
		if n := len(m.b6Val); n > 0 && m.b6Val[n-1] == vals[i] {
			continue
		}
		m.b6Start = append(m.b6Start, s)
		m.b6Val = append(m.b6Val, vals[i])
	}
	m.top6 = make([]int32, (1<<top6Bits)+1)
	i := 0
	for t := 0; t <= 1<<top6Bits; t++ {
		for i < len(m.b6Start) && m.b6Start[i].hi>>(64-top6Bits) < uint64(t) {
			i++
		}
		m.top6[t] = int32(i)
	}
}

// Lookup returns the value of the longest matching network.
func (m *Map[V]) Lookup(ip net.IP) (V, bool) {
	var zero V
	if ip4 := ip.To4(); ip4 != nil {
		return m.lookup4(binary.BigEndian.Uint32(ip4))
	}
	if len(ip) != net.IPv6len {
		return zero, false
	}
	return m.lookup6(key6{binary.BigEndian.Uint64(ip[:8]), binary.BigEndian.Uint64(ip[8:])})
}

// LookupAddr is Lookup for a netip.Addr: IPv4 and IPv4-mapped addresses match IPv4
// networks (as net.IP.To4 does), any other address IPv6 networks. Addresses with a
// zone never match (net.ParseIP rejects them).
func (m *Map[V]) LookupAddr(a netip.Addr) (V, bool) {
	var zero V
	if !a.IsValid() || a.Zone() != "" {
		return zero, false
	}
	if a.Is4() || a.Is4In6() {
		b := a.Unmap().As4()
		return m.lookup4(binary.BigEndian.Uint32(b[:]))
	}
	b := a.As16()
	return m.lookup6(key6{binary.BigEndian.Uint64(b[:8]), binary.BigEndian.Uint64(b[8:])})
}

func (m *Map[V]) lookup4(addr uint32) (V, bool) {
	m.Build()
	var zero V
	{
		t := addr >> (32 - top4Bits)
		lo, hi := int(m.top4[t]), int(m.top4[t+1])
		// first boundary in [lo, hi) starting after addr; the one before it covers addr
		for lo < hi {
			mid := int(uint(lo+hi) >> 1)
			if m.b4Start[mid] <= addr {
				lo = mid + 1
			} else {
				hi = mid
			}
		}
		if lo == 0 || m.b4Val[lo-1] < 0 {
			return zero, false
		}
		return m.vals[m.b4Val[lo-1]], true
	}
}

func (m *Map[V]) lookup6(addr key6) (V, bool) {
	m.Build()
	var zero V
	t := addr.hi >> (64 - top6Bits)
	lo, hi := int(m.top6[t]), int(m.top6[t+1])
	for lo < hi {
		mid := int(uint(lo+hi) >> 1)
		if !less6(addr, m.b6Start[mid]) { // start <= addr
			lo = mid + 1
		} else {
			hi = mid
		}
	}
	if lo == 0 || m.b6Val[lo-1] < 0 {
		return zero, false
	}
	return m.vals[m.b6Val[lo-1]], true
}
