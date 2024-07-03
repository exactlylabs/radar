package wifi

import (
	"fmt"
	"slices"
)

type SecType string

const (
	None             SecType = "none"
	WEP              SecType = "wep"
	WPA              SecType = "wpa"
	WPA2             SecType = "wpa2"
	WPA2_3           SecType = "wpa2/3"
	WPAEnterprise    SecType = "wpa-enterprise"
	WPA2Enterprise   SecType = "wpa2-enterprise"
	WPA2_3Enterprise SecType = "wpa2/3-enterprise"
)

func (s SecType) toKeyMgmt() string {
	switch s {
	case None:
		return "NONE"
	case WEP, WPA, WPA2, WPA2_3:
		return "WPA-PSK"
	case WPAEnterprise, WPA2Enterprise, WPA2_3Enterprise:
		return "WPA-EAP"
	}
	return ""
}

// network holds all information on configured networks
type network struct {
	ID       string
	SSID     string
	BSSID    string
	KeyMgmt  string
	Identity string // Enterprise mode
	PSK      string // Pre-Shared Key
	Password string // For Enterprise mode
	Flags    []string

	Registered bool
}

func (n network) merge(other network) network {
	merged := network{ID: n.ID, SSID: n.SSID, Flags: n.Flags, Registered: n.Registered}

	if other.KeyMgmt != "" {
		merged.KeyMgmt = other.KeyMgmt
	}
	if other.Identity != "" {
		merged.Identity = other.Identity
	}
	if other.PSK != "" {
		merged.PSK = other.PSK
	}
	if other.Password != "" {
		merged.Password = other.Password
	}
	return merged
}

func (n *network) attributes() []string {
	attrs := make([]string, 0)
	appendIfNotEmpty(attrs, "ssid", n.SSID)
	appendIfNotEmpty(attrs, "key_mgmt", n.KeyMgmt)
	appendIfNotEmpty(attrs, "identity", n.Identity)
	appendIfNotEmpty(attrs, "psk", n.PSK)
	appendIfNotEmpty(attrs, "password", n.Password)
	return attrs
}

func (n *network) fillAttributes(attrGetter func(id, key string) string) {
	n.SSID = attrGetter(n.ID, "ssid")
	n.KeyMgmt = attrGetter(n.ID, "key_mgmt")
	n.Identity = attrGetter(n.Identity, "identity")
}

// IsDisabled will return true if the network is disabled
func (net network) isDisabled() bool {
	for _, f := range net.Flags {
		if f == "DISABLED" {
			return true
		}
	}
	return false
}

// IsCurrent will return true if the network is the currently active one
func (net network) isCurrent() bool {
	for _, f := range net.Flags {
		if f == "CURRENT" {
			return true
		}
	}
	return false
}

func appendIfNotEmpty(attrs []string, key, value string) []string {
	if value != "" {
		return append(attrs, fmt.Sprintf("%s %s", key, value))
	}
	return attrs
}

type networks []network

func (n networks) findById(id string) *network {
	for _, network := range n {
		if network.ID == id {
			return &network
		}
	}
	return nil
}

func (n networks) findBySSID(ssid string) *network {
	for _, network := range n {
		if network.SSID == ssid {
			return &network
		}
	}
	return nil
}

func (n networks) findCurrent() *network {
	for _, network := range n {
		if network.isCurrent() {
			return &network
		}
	}
	return nil
}

// NetworkConnectionData is the public-facing structure with only the necessary
// information on how to connect to a network.
type NetworkConnectionData struct {
	SSID     string  `json:"ssid"`
	Security SecType `json:"security"`
	Identity string  `json:"identity"` // For Enterprise types
	Password string  `json:"password"`
}

func (data NetworkConnectionData) toNetwork() network {
	net := network{
		SSID:    data.SSID,
		KeyMgmt: data.Security.toKeyMgmt(),
	}

	if slices.Contains([]SecType{WEP, WPA, WPA2, WPA2_3}, data.Security) {
		net.PSK = data.Password
	} else { // Business type
		net.Identity = data.Identity
		net.Password = data.Password
	}
	return net
}
