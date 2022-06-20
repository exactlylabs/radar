package update

import (
	"crypto"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"io/ioutil"

	"google.golang.org/protobuf/proto"
)

var (
	ErrInvalidCertificate error = errors.New("certificate is not valid")
	ErrInvalidSignature   error = errors.New("signature is not valid")
)

// ParseUpdateFile will read from the reader and then validate the contents of it,
// ensuring that the file is a valid binary to update
func ParseUpdateFile(r io.Reader) ([]byte, error) {
	sb, err := readFile(r)
	if err != nil {
		return nil, err
	}
	rootCert, err := parseCertificate(rootCAFile)
	if err != nil {
		return nil, err
	}
	// Validating the Provider Certificate
	cert, err := parseCertificate(sb.GetCertificate())
	if err != nil {
		return nil, err
	}
	// Check if it's signed by our trusted CA
	if err := verifyCertificate(cert, rootCert); err != nil {
		return nil, ErrInvalidCertificate
	}

	// Validate the binary was not tampered
	if err := verifySignature(cert, sb.GetBinary(), sb.GetSignature()); err != nil {
		return nil, ErrInvalidSignature
	}

	return sb.GetBinary(), nil
}

func readFile(r io.Reader) (*SignedBinary, error) {
	data, err := ioutil.ReadAll(r)
	if err != nil {
		return nil, fmt.Errorf("update.ParseUpdateFile error reading: %w", err)
	}
	sb := &SignedBinary{}
	if err := proto.Unmarshal(data, sb); err != nil {
		return nil, fmt.Errorf("update.ParseUpdateFile error unmarshalling: %w", err)
	}
	return sb, nil
}

func parseCertificate(data []byte) (*x509.Certificate, error) {
	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("update.parseCertificate invalid PEM format")
	}
	cert, err := x509.ParseCertificate(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("update.parseCertificate error parsing: %w", err)
	}
	return cert, nil
}

func verifyCertificate(binCert, rootCert *x509.Certificate) error {
	if err := binCert.CheckSignatureFrom(rootCert); err != nil {
		return fmt.Errorf("update.verifyCertificate error: %w", err)
	}
	return nil
}

func verifySignature(binCert *x509.Certificate, binary []byte, signature []byte) error {
	hasher := sha256.New()
	hasher.Write(binary)
	binHash := hasher.Sum(nil)

	pbk := binCert.PublicKey.(*rsa.PublicKey)
	err := rsa.VerifyPKCS1v15(pbk, crypto.SHA256, binHash, signature)
	if err != nil {
		return fmt.Errorf("update.verifySignature error: %w", err)
	}
	return nil
}

func ParseSignedBinary(path string) (*SignedBinary, error) {
	s := &SignedBinary{}
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	if err := proto.Unmarshal(data, s); err != nil {
		return nil, err
	}
	return s, nil
}
