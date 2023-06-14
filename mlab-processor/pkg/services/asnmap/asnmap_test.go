package asnmap_test

import (
	"errors"
	"strings"
	"testing"

	"github.com/exactlylabs/mlab-processor/pkg/services/asnmap"
)

var db_ok = `
{"changed":"20191028","country":"US","name":"Test Organization 1","organizationId":"Test1","source":"MOCK","type":"Organization"}
{"changed":"20171130","country":"BR","name":"Test Organization 2","organizationId":"Test2","source":"MOCK","type":"Organization"}
{"asn":"1234","changed":"20220130","name":"TestASN1","opaqueId":"asdf","organizationId":"Test1","source":"APNIC","type":"ASN"}
{"asn":"1234","changed":"20220130","name":"TestASN2","opaqueId":"ccc","organizationId":"Test2","source":"APNIC","type":"ASN"}
{"asn":"4321","changed":"20220130","name":"TestASN3","opaqueId":"aaaa","organizationId":"Test2","source":"APNIC","type":"ASN"}
{"asn":"1123","changed":"20220130","name":"TestASN4","opaqueId":"bbb","organizationId":"Test1","source":"APNIC","type":"ASN"}
`

var db_missing_org = `
{"changed":"20191028","country":"US","name":"Test Organization 1","organizationId":"Test1","source":"MOCK","type":"Organization"}
{"asn":"1234","changed":"20220130","name":"TestASN1","opaqueId":"asdf","organizationId":"Test1","source":"APNIC","type":"ASN"}
{"asn":"1234","changed":"20220130","name":"TestASN2","opaqueId":"ccc","organizationId":"Test2","source":"APNIC","type":"ASN"}
{"asn":"4321","changed":"20220130","name":"TestASN3","opaqueId":"aaaa","organizationId":"Test2","source":"APNIC","type":"ASN"}
{"asn":"1123","changed":"20220130","name":"TestASN4","opaqueId":"bbb","organizationId":"Test1","source":"APNIC","type":"ASN"}
`

func TestASNLoadOk(t *testing.T) {
	reader := strings.NewReader(db_ok)
	_, err := asnmap.New(reader)
	if err != nil {
		t.Fatalf("failed loading db_ok: %v", err)
	}
}

func TestASNLoadMissingOrg(t *testing.T) {
	reader := strings.NewReader(db_missing_org)
	_, err := asnmap.New(reader)
	if err == nil {
		t.Fatal("load_missing_org didn't return an error")
	} else if !errors.Is(err, asnmap.ErrMissingOrg) {
		t.Fatalf("load_missing_org expected ErrMissingOrg, got %T", err)
	}
}
