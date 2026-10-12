package netmap

import (
	"encoding/csv"
	"io"
	"math/rand"
	"net"
	"os"
	"path/filepath"
	"testing"
)

func TestLookup(t *testing.T) {
	m := New[string]()
	_, n1, _ := net.ParseCIDR("10.1.3.2/23")
	m.Add(n1, "hello")
	_, n2, _ := net.ParseCIDR("10.3.3.2/23")
	m.Add(n2, "world")

	if v, _ := m.Lookup(net.ParseIP("10.1.3.2")); v != "hello" {
		t.Fatalf("Expected '10.1.3.2' to return 'hello'")
	}
	if v, _ := m.Lookup(net.ParseIP("10.3.3.2")); v != "world" {
		t.Fatalf("Expected '10.3.3.2' to return 'world'")
	}
	if _, ok := m.Lookup(net.ParseIP("10.4.3.2")); ok {
		t.Fatalf("Expected '10.4.3.2' to return nothing")
	}
}

func TestAddAfterBuildPanics(t *testing.T) {
	m := New[int]()
	m.Build()
	defer func() {
		if recover() == nil {
			t.Fatal("expected panic")
		}
	}()
	_, n, _ := net.ParseCIDR("1.0.0.0/8")
	m.Add(n, 1)
}

// pair holds the legacy and the new map, filled with the same networks.
type pair struct {
	old *legacyNetMap
	new *Map[int]
	n   int
}

func newPair() *pair { return &pair{old: newLegacyNetMap(), new: New[int]()} }

func (p *pair) add(n *net.IPNet) {
	p.old.Add(n, p.n)
	p.new.Add(n, p.n)
	p.n++
}

func (p *pair) addCIDR(t *testing.T, s string) {
	_, n, err := net.ParseCIDR(s)
	if err != nil {
		t.Fatal(err)
	}
	p.add(n)
}

func (p *pair) check(t *testing.T, ip net.IP) bool {
	t.Helper()
	ov := p.old.Lookup(ip)
	nv, ok := p.new.Lookup(ip)
	if ov == nil {
		if ok {
			t.Errorf("%v: legacy=nil new=%d", ip, nv)
			return false
		}
		return true
	}
	if !ok || ov.(int) != nv {
		t.Errorf("%v: legacy=%v new=%d (found=%v)", ip, ov, nv, ok)
		return false
	}
	return true
}

func TestMatchesLegacySynthetic(t *testing.T) {
	p := newPair()
	cidrs := []string{
		// overlapping IPv4
		"10.0.0.0/8", "10.1.0.0/16", "10.1.2.0/24", "10.1.2.128/25", "10.1.2.255/32",
		"0.0.0.0/1", "128.0.0.0/1", "255.255.255.255/32", "0.0.0.0/32",
		// duplicate network: last value must win
		"192.168.0.0/16", "192.168.0.0/16",
		// default route never matches (the old code stops at /1)
		"0.0.0.0/0", "::/0",
		// IPv6, overlapping, around the 64-bit boundary
		"2001:db8::/32", "2001:db8::/48", "2001:db8:0:1::/64", "2001:db8:0:1:8000::/65",
		"2001:db8:0:1::1/128", "2001:db8:ffff:ffff::/63", "8000::/1", "::/1", "::1/128",
		"ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128", "2600::/12",
		// IPv4-mapped IPv6: /96 and longer behave like IPv4 networks in the old map
		"::ffff:11.0.0.0/104", "::ffff:12.34.0.0/112", "::ffff:0:0/96", "::ffff:0:0/90",
		// IPv4-compatible / NAT64 ranges stay IPv6
		"::1.2.3.0/120", "64:ff9b::/96", "64:ff9b::808:800/120",
	}
	for _, c := range cidrs {
		p.addCIDR(t, c)
	}
	// Networks with host bits / non-canonical masks: unreachable in both.
	p.add(&net.IPNet{IP: net.ParseIP("20.0.0.1").To4(), Mask: net.CIDRMask(8, 32)})
	p.add(&net.IPNet{IP: net.ParseIP("21.0.0.0").To4(), Mask: net.IPv4Mask(255, 0, 255, 0)})
	p.add(&net.IPNet{IP: net.ParseIP("22.0.0.0"), Mask: net.CIDRMask(8, 32)})          // 16-byte v4 ip, 4-byte mask
	p.add(&net.IPNet{IP: net.ParseIP("2001:db9::").To16(), Mask: net.CIDRMask(8, 32)}) // v6 ip, 4-byte mask
	p.add(&net.IPNet{IP: net.ParseIP("23.0.0.0").To4(), Mask: net.CIDRMask(104, 128)}) // v4 ip, 16-byte mask
	p.add(&net.IPNet{IP: net.IP{1, 2, 3}, Mask: net.CIDRMask(8, 24)})                  // bad length
	p.add(&net.IPNet{IP: net.ParseIP("2001:dba::"), Mask: net.IPMask{0xff, 0xff, 0, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0}})

	ips := []string{
		"10.0.0.0", "10.1.2.3", "10.1.2.129", "10.1.2.255", "10.255.255.255", "11.0.0.1", "11.255.1.1",
		"12.34.5.6", "12.35.0.0", "0.0.0.0", "0.0.0.1", "127.0.0.1", "128.0.0.0", "255.255.255.255",
		"192.168.1.1", "20.0.0.1", "21.0.0.0", "22.1.1.1", "23.1.1.1", "1.2.3.4",
		"::ffff:10.1.2.3", "::ffff:11.1.1.1", "::ffff:0.0.0.0",
		"2001:db8::1", "2001:db8:0:1::1", "2001:db8:0:1::2", "2001:db8:0:1:8000::1", "2001:db8:ffff:ffff:1::",
		"2001:db8:ffff:fffe::", "2001:db9::1", "2001:dba::1", "::", "::1", "::2", "::1.2.3.4", "::1.2.4.4",
		"64:ff9b::8.8.8.8", "64:ff9b::1.1.1.1", "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", "2600:1234::1", "fe80::1",
	}
	for _, s := range ips {
		ip := net.ParseIP(s)
		if ip == nil {
			t.Fatalf("bad test ip %q", s)
		}
		p.check(t, ip)
		p.check(t, ip.To16())
	}
	// invalid / odd inputs
	p.check(t, nil)
	p.check(t, net.IP{1, 2, 3})
	p.check(t, net.ParseIP("not an ip"))

	r := rand.New(rand.NewSource(1))
	for i := 0; i < 200000; i++ {
		p.check(t, randomIP(r))
	}
}

func randomIP(r *rand.Rand) net.IP {
	switch r.Intn(4) {
	case 0:
		ip := make(net.IP, 4)
		r.Read(ip)
		return ip
	case 1:
		ip := make(net.IP, 16)
		r.Read(ip)
		return ip
	case 2: // close to the synthetic networks
		ip := net.ParseIP("10.1.2.0").To4()
		ip[2] = byte(r.Intn(4))
		ip[3] = byte(r.Intn(256))
		return ip
	default:
		ip := net.ParseIP("2001:db8::")
		ip[5] = byte(r.Intn(2))
		ip[7] = byte(r.Intn(3))
		ip[8] = byte(r.Intn(256))
		return ip
	}
}

// TestMatchesLegacyRealCSV compares both implementations over the real GeoLite2 CSVs.
// Set NETMAP_CSV_DIR to a directory with GeoLite2-{City,ASN}-Blocks-IPv{4,6}.csv.
func TestMatchesLegacyRealCSV(t *testing.T) {
	dir := os.Getenv("NETMAP_CSV_DIR")
	if dir == "" {
		t.Skip("NETMAP_CSV_DIR not set")
	}
	for _, set := range [][]string{
		{"GeoLite2-City-Blocks-IPv4.csv", "GeoLite2-City-Blocks-IPv6.csv"},
		{"GeoLite2-ASN-Blocks-IPv4.csv", "GeoLite2-ASN-Blocks-IPv6.csv"},
	} {
		t.Run(set[0], func(t *testing.T) {
			p := newPair()
			var nets []*net.IPNet
			for _, f := range set {
				nets = append(nets, loadNetworks(t, filepath.Join(dir, f))...)
			}
			for _, n := range nets {
				p.add(n)
			}
			r := rand.New(rand.NewSource(42))
			checked, failures := 0, 0
			try := func(ip net.IP) {
				checked++
				if !p.check(t, ip) {
					failures++
					if failures > 20 {
						t.FailNow()
					}
				}
			}
			for i := 0; i < 300000; i++ {
				try(randomIP(r))
			}
			// addresses inside, at the edges of and just outside sampled networks
			for i := 0; i < 300000; i++ {
				n := nets[r.Intn(len(nets))]
				first := n.IP
				last := lastIP(n)
				try(first)
				try(last)
				try(nextIP(last))
				try(prevIP(first))
				inside := make(net.IP, len(first))
				copy(inside, first)
				for b := range inside {
					inside[b] |= byte(r.Intn(256)) &^ n.Mask[b]
				}
				try(inside)
				if len(first) == 4 {
					try(first.To16()) // ::ffff:a.b.c.d form of the same address
				}
			}
			t.Logf("%d networks, %d lookups identical", len(nets), checked)
		})
	}
}

func loadNetworks(t *testing.T, path string) []*net.IPNet {
	f, err := os.Open(path)
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()
	r := csv.NewReader(f)
	header, err := r.Read()
	if err != nil {
		t.Fatal(err)
	}
	col := -1
	for i, h := range header {
		if h == "network" {
			col = i
		}
	}
	var out []*net.IPNet
	for {
		rec, err := r.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			t.Fatal(err)
		}
		_, n, err := net.ParseCIDR(rec[col])
		if err != nil {
			t.Fatal(err)
		}
		out = append(out, n)
	}
	return out
}

func lastIP(n *net.IPNet) net.IP {
	ip := make(net.IP, len(n.IP))
	for i := range ip {
		ip[i] = n.IP[i] | ^n.Mask[i]
	}
	return ip
}

func nextIP(ip net.IP) net.IP {
	out := append(net.IP(nil), ip...)
	for i := len(out) - 1; i >= 0; i-- {
		out[i]++
		if out[i] != 0 {
			break
		}
	}
	return out
}

func prevIP(ip net.IP) net.IP {
	out := append(net.IP(nil), ip...)
	for i := len(out) - 1; i >= 0; i-- {
		out[i]--
		if out[i] != 0xff {
			break
		}
	}
	return out
}

func BenchmarkLookup(b *testing.B) {
	m := New[int]()
	old := newLegacyNetMap()
	r := rand.New(rand.NewSource(1))
	for i := 0; i < 100000; i++ {
		ip := make(net.IP, 4)
		r.Read(ip)
		n := &net.IPNet{IP: ip.Mask(net.CIDRMask(24, 32)), Mask: net.CIDRMask(24, 32)}
		m.Add(n, i)
		old.Add(n, i)
	}
	m.Build()
	ips := make([]net.IP, 1024)
	for i := range ips {
		ips[i] = randomIP(r)
	}
	b.Run("new", func(b *testing.B) {
		b.ReportAllocs()
		for i := 0; i < b.N; i++ {
			m.Lookup(ips[i%len(ips)])
		}
	})
	b.Run("legacy", func(b *testing.B) {
		b.ReportAllocs()
		for i := 0; i < b.N; i++ {
			old.Lookup(ips[i%len(ips)])
		}
	})
}
