package wifi

import (
	"fmt"
	"slices"
)

type SecType string

const (
	None           SecType = "none"
	WEP            SecType = "wep"
	WPA            SecType = "wpa"
	WPA2           SecType = "wpa2"
	WPAEnterprise  SecType = "wpa-enterprise"
	WPA2Enterprise SecType = "wpa2-enterprise"
)

func (s SecType) toKeyMgmt() string {
	switch s {
	case None, WEP:
		return "NONE"
	case WPA, WPA2:
		return "WPA-PSK"
	case WPAEnterprise, WPA2Enterprise:
		return "WPA-EAP"
	}
	return "" // unknown, try to let the driver figure it out
}

func (s SecType) toProtocol() string {
	switch s {
	case WPA, WPAEnterprise:
		return "WPA"
	case WPA2, WPA2Enterprise:
		return "WPA2"
	}
	return ""

}

// network holds all information on configured networks
type network struct {
	ID          string
	SSID        string
	BSSID       string
	KeyMgmt     string
	Protocol    string
	Identity    string // For Enterprise mode
	PSK         string // Pre-Shared Key
	Password    string // For Enterprise mode
	WEPPassword string // For WEP mode
	WEPKeyIdx   string // For WEP mode
	ScanSSID    string // set to 1 if the SSID is hidden
	Flags       []string
	Registered  bool
}

func (n network) merge(other network) network {
	merged := network{ID: n.ID, SSID: n.SSID, Flags: n.Flags, Registered: n.Registered}

	if other.KeyMgmt != "" {
		merged.KeyMgmt = other.KeyMgmt
	}
	if other.Protocol != "" {
		merged.Protocol = other.Protocol
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
	if other.WEPPassword != "" {
		merged.WEPPassword = other.WEPPassword
	}
	if other.WEPKeyIdx != "" {
		merged.WEPKeyIdx = other.WEPKeyIdx
	}
	if other.ScanSSID != "" {
		merged.ScanSSID = other.ScanSSID
	}
	return merged
}

func (n *network) attributes() []string {
	attrs := make([]string, 0)
	attrs = appendIfNotEmpty(attrs, "ssid", n.SSID, true)
	attrs = appendIfNotEmpty(attrs, "key_mgmt", n.KeyMgmt, false)
	attrs = appendIfNotEmpty(attrs, "proto", n.Protocol, false)
	attrs = appendIfNotEmpty(attrs, "identity", n.Identity, true)
	attrs = appendIfNotEmpty(attrs, "psk", n.PSK, true)
	attrs = appendIfNotEmpty(attrs, "password", n.Password, true)
	attrs = appendIfNotEmpty(attrs, "wep_key0", n.WEPPassword, true)
	attrs = appendIfNotEmpty(attrs, "wep_tx_keyidx", n.WEPKeyIdx, false)
	attrs = appendIfNotEmpty(attrs, "scan_ssid", n.ScanSSID, false)
	return attrs
}

func (n *network) fillAttributes(attrGetter func(id, key string) string) {
	n.SSID = attrGetter(n.ID, "ssid")
	n.KeyMgmt = attrGetter(n.ID, "key_mgmt")
	n.Protocol = attrGetter(n.ID, "proto")
	n.Identity = attrGetter(n.Identity, "identity")
	n.WEPKeyIdx = attrGetter(n.ID, "wep_tx_keyidx")
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

func appendIfNotEmpty(attrs []string, key, value string, quote bool) []string {
	if value != "" {
		if quote {
			value = `"` + value + `"`
		}
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
	Hidden   bool    `json:"hidden"`
}

func (data NetworkConnectionData) toNetwork() network {
	net := network{
		SSID:     data.SSID,
		KeyMgmt:  data.Security.toKeyMgmt(),
		Protocol: data.Security.toProtocol(),
		ScanSSID: "0",
	}

	if data.Hidden {
		net.ScanSSID = "1"
	}

	if data.Security == WEP {
		net.WEPPassword = data.Password
		net.WEPKeyIdx = "0"

	} else if slices.Contains([]SecType{WPA, WPA2}, data.Security) {
		net.PSK = data.Password

	} else { // Business type
		net.Identity = data.Identity
		net.Password = data.Password
	}

	return net
}
