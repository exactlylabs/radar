package update

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
)

func SignBinary(binary []byte, pkey *rsa.PrivateKey) []byte {
	hasher := sha256.New()
	_, err := hasher.Write(binary)
	if err != nil {
		panic(err)
	}
	binHash := hasher.Sum(nil)
	// Now we sign this binary Hash
	signature, err := rsa.SignPKCS1v15(rand.Reader, pkey, crypto.SHA256, binHash)
	if err != nil {
		panic(err)
	}
	return signature
}
