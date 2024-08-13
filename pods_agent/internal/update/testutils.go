package update

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"math/big"
	"time"
)

func genTestRootCA() (certBytes []byte, certPEM []byte, priv *rsa.PrivateKey) {
	rootCA := &x509.Certificate{
		SerialNumber: big.NewInt(1),
		Subject: pkix.Name{
			Country:      []string{"US"},
			Organization: []string{"ACME"},
			CommonName:   "Root CA",
		},
		NotBefore:             time.Now(),
		NotAfter:              time.Now().AddDate(1, 0, 0),
		KeyUsage:              x509.KeyUsageCertSign | x509.KeyUsageCRLSign,
		ExtKeyUsage:           []x509.ExtKeyUsage{},
		BasicConstraintsValid: true,
		IsCA:                  true,
		MaxPathLen:            1,
	}
	var err error
	priv, err = rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}
	certBytes, err = x509.CreateCertificate(rand.Reader, rootCA, rootCA, &priv.PublicKey, priv)
	if err != nil {
		panic("Failed to create certificate:" + err.Error())
	}
	b := pem.Block{Type: "CERTIFICATE", Bytes: certBytes}
	certPEM = pem.EncodeToMemory(&b)
	return
}

func genTestBinCert(serialNumber int64, rootCA *x509.Certificate, rootKey *rsa.PrivateKey) (certBytes []byte, certPEM []byte, priv *rsa.PrivateKey) {
	binCert := &x509.Certificate{
		SerialNumber:   big.NewInt(serialNumber),
		NotBefore:      time.Now(),
		NotAfter:       time.Now().AddDate(1, 0, 0),
		KeyUsage:       x509.KeyUsageDigitalSignature,
		ExtKeyUsage:    []x509.ExtKeyUsage{x509.ExtKeyUsageCodeSigning},
		IsCA:           false,
		MaxPathLenZero: true,
	}
	var err error
	priv, err = rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}
	certBytes, err = x509.CreateCertificate(rand.Reader, binCert, rootCA, &priv.PublicKey, rootKey)
	if err != nil {
		panic("Failed to create certificate:" + err.Error())
	}
	b := pem.Block{Type: "CERTIFICATE", Bytes: certBytes}
	certPEM = pem.EncodeToMemory(&b)
	return
}

func genTestCRLV2(number int64, rootCA *x509.Certificate, rootKey *rsa.PrivateKey, expirationTime time.Time, revokedCerts ...*x509.Certificate) (crlBytes []byte, crlPEM []byte) {
	entries := make([]x509.RevocationListEntry, len(revokedCerts))
	for i, revokedCert := range revokedCerts {
		entries[i] = x509.RevocationListEntry{
			SerialNumber:   revokedCert.SerialNumber,
			RevocationTime: time.Now(),
			ReasonCode:     0,
		}
	}
	crlTemplate := x509.RevocationList{
		Issuer:                    rootCA.Issuer,
		ThisUpdate:                time.Now(),
		NextUpdate:                expirationTime,
		RevokedCertificateEntries: entries,
		Number:                    big.NewInt(number),
	}
	var err error
	crlBytes, err = x509.CreateRevocationList(rand.Reader, &crlTemplate, rootCA, rootKey)
	if err != nil {
		panic(err)
	}
	b := pem.Block{Type: "X509 CRL", Bytes: crlBytes}
	crlPEM = pem.EncodeToMemory(&b)
	return
}

type testCertificates struct {
	rootCACert *x509.Certificate
	rootCA     []byte
	rootKey    *rsa.PrivateKey
	rootCAPEM  []byte
	binCert    []byte
	binKey     *rsa.PrivateKey
	binCertPEM []byte
}

func setupTestCertificates() *testCertificates {
	certs := &testCertificates{}

	certs.rootCA, certs.rootCAPEM, certs.rootKey = genTestRootCA()
	certs.rootCACert, _ = x509.ParseCertificate(certs.rootCA)

	certs.binCert, certs.binCertPEM, certs.binKey = genTestBinCert(1, certs.rootCACert, certs.rootKey)

	// replace the embedded file contents with the test one.
	rootCAFile = certs.rootCAPEM

	return certs
}
