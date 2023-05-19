package web100

const (
	BEGIN_SNAP_DATA   = "----Begin-Snap-Data----\n"
	END_OF_HEADER     = "\x00----End-Of-Header---- -1 -1\n"
	GROUPNAME_LEN_MAX = 32
	VARNAME_LEN_MAX   = 32
)

type varType int

const (
	// The ordering here is important, as it reflects the type values
	// defined by the web100 libraries.  Do not change ordering.
	WEB100_TYPE_INTEGER varType = iota
	WEB100_TYPE_INTEGER32
	WEB100_TYPE_INET_ADDRESS_IPV4
	WEB100_TYPE_COUNTER32
	WEB100_TYPE_GAUGE32
	WEB100_TYPE_UNSIGNED32
	WEB100_TYPE_TIME_TICKS
	WEB100_TYPE_COUNTER64
	WEB100_TYPE_INET_PORT_NUMBER
	WEB100_TYPE_INET_ADDRESS
	WEB100_TYPE_INET_ADDRESS_IPV6
	WEB100_TYPE_STR32
	WEB100_TYPE_OCTET
	WEB100_NUM_TYPES
)

type addrType int

const (
	// The ordering here is important, as it reflects the type values
	// defined by the web100 libraries.  Do not change ordering.
	WEB100_ADDRTYPE_UNKNOWN addrType = iota
	WEB100_ADDRTYPE_IPV4
	WEB100_ADDRTYPE_IPV6
	WEB100_ADDRTYPE_DNS = 16
)

var web100Sizes = [WEB100_NUM_TYPES + 1]int{
	4,  /*INTEGER*/
	4,  /*INTEGER32*/
	4,  /*IPV4*/
	4,  /*COUNTER32*/
	4,  /*GAUGE32*/
	4,  /*UNSIGNED32*/
	4,  /*TIME_TICKS*/
	8,  /*COUNTER64*/
	2,  /*PORT_NUM*/
	17, /*INET_ADDRESS*/
	17, /*INET_ADDRESS_IPV6*/
	32, /*STR32*/
	1,  /*OCTET*/
	0,
}
