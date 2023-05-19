/*
 This package was taken and adapted from https://github.com/m-lab/etl/blob/master/web100/web100.go

 It aims to parse web100 snapshot files into Snaplogs (collections of Snapshots)
*/
package web100

import "bytes"

var CanonicalNames map[string]string

func init() {
	var err error
	b := bytes.NewBuffer(tcpKis)
	CanonicalNames, err = ParseWeb100Definitions(b)
	if err != nil {
		panic("error parsing tcpKis")
	}
}
