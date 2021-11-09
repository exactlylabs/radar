package netmap

import (
	"net"
	"testing"
)

func TestLookup(t *testing.T) {
	m := NewNetMap()
	_, n1, _ := net.ParseCIDR("10.1.3.2/23")
	m.Add(n1, "hello")
	_, n2, _ := net.ParseCIDR("10.3.3.2/23")
	m.Add(n2, "world")

	if m.Lookup(net.ParseIP("10.1.3.2")).(string) != "hello" {
		t.Fatalf("Expected '10.1.3.2' to return 'hello'")
	}

	if m.Lookup(net.ParseIP("10.3.3.2")).(string) != "world" {
		t.Fatalf("Expected '10.3.3.2' to return 'world'")
	}

	if m.Lookup(net.ParseIP("10.4.3.2")) != nil {
		t.Fatalf("Expected '10.4.3.2' to return nil")
	}
}
