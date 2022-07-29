package sysinfo

import (
	"net"
)

type NetInterface struct {
	IfaceName string
	IfaceMac  string
	IfaceIps  []net.Addr
}

func (ni NetInterface) Name() string    { return ni.IfaceName }
func (ni NetInterface) MAC() string     { return ni.IfaceMac }
func (ni NetInterface) IPs() []net.Addr { return ni.IfaceIps }
