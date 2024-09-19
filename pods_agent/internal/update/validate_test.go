package update

import (
	"bytes"
	"crypto/x509"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/exactlylabs/go-errors/pkg/errors"
	"github.com/exactlylabs/radar/pods_agent/config"
	"google.golang.org/protobuf/proto"
)

func TestReadFileEmpty(t *testing.T) {
	_, err := readFile(bytes.NewReader([]byte{}))
	if !errors.Is(err, ErrEmptyFile) {
		t.Fatal("expected ErrEmptyFile")
	}
}

func TestVerifyCertificate(t *testing.T) {
	certs := setupTestCertificates()
	binCert, _ := x509.ParseCertificate(certs.binCert)
	if err := verifyCertificate(binCert, certs.rootCACert); err != nil {
		t.Fatal("expected cert to be signed by root")
	}
}

func TestCertNotRevoked(t *testing.T) {
	certs := setupTestCertificates()

	// Configure CRL Server with binCert not revoked and valid CRL
	c := config.LoadConfig()
	_, crlPEM := genTestCRLV2(1, certs.rootCACert, certs.rootKey, time.Now().AddDate(1, 0, 0))
	testServer := httptest.NewServer(http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		res.WriteHeader(200)
		res.Write(crlPEM)
	}))
	defer testServer.Close()
	c.CRLUrl = testServer.URL

	binCert, _ := x509.ParseCertificate(certs.binCert)

	if err := verifyCertIsRevoked(binCert, certs.rootCACert); err != nil {
		t.Fatal(err)
	}
}

func TestCertRevokedDetected(t *testing.T) {
	certs := setupTestCertificates()
	binCert, _ := x509.ParseCertificate(certs.binCert)

	// Configure CRL Server with binCert revoked and valid CRL
	c := config.LoadConfig()
	_, crlPEM := genTestCRLV2(1, certs.rootCACert, certs.rootKey, time.Now().AddDate(1, 0, 0), binCert)
	testServer := httptest.NewServer(http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		res.WriteHeader(200)
		res.Write(crlPEM)
	}))
	defer testServer.Close()
	c.CRLUrl = testServer.URL

	if err := verifyCertIsRevoked(binCert, certs.rootCACert); !errors.Is(err, ErrCertificateRevoked) {
		t.Fatalf("expected certificate to be revoked: %v", err)
	}
}

func TestDetectCrlFromDifferentCA(t *testing.T) {
	certs := setupTestCertificates()
	binCert, _ := x509.ParseCertificate(certs.binCert)

	newCA, _, priv := genTestRootCA()
	newCACert, _ := x509.ParseCertificate(newCA)

	// Configure CRL Server with binCert not revoked and invalid CRL
	c := config.LoadConfig()
	_, crlPEM := genTestCRLV2(1, newCACert, priv, time.Now().AddDate(1, 0, 0))
	testServer := httptest.NewServer(http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		res.WriteHeader(200)
		res.Write(crlPEM)
	}))
	defer testServer.Close()
	c.CRLUrl = testServer.URL

	if err := verifyCertIsRevoked(binCert, certs.rootCACert); !errors.Is(err, ErrCRLInvalidSignature) {
		t.Fatalf("expected CRL to be invalid: %v", err)
	}
}

func TestParseUpdateFileValidBinary(t *testing.T) {
	certs := setupTestCertificates()

	// Configure CRL Server with binCert not revoked and valid CRL
	c := config.LoadConfig()
	_, crlPEM := genTestCRLV2(1, certs.rootCACert, certs.rootKey, time.Now().AddDate(1, 0, 0))
	testServer := httptest.NewServer(http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		res.WriteHeader(200)
		res.Write(crlPEM)
	}))
	defer testServer.Close()
	c.CRLUrl = testServer.URL

	sb := &SignedBinary{
		Binary:      []byte("Something to sign"),
		Certificate: certs.binCertPEM,
	}
	sb.Signature = SignBinary(sb.Binary, certs.binKey)
	signedBin, err := proto.Marshal(sb)
	if err != nil {
		panic(err)
	}
	b := bytes.NewBuffer(signedBin)
	binaryData, err := ParseUpdateFile(b)
	if err != nil {
		t.Fatalf("expected binary to be parsed, failed with: %v", err)
	}
	if !bytes.Equal(sb.Binary, binaryData) {
		t.Fatalf("expected %s, got %s", sb.Binary, binaryData)
	}
}
