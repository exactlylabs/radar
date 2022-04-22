package main

import (
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/pem"
	"flag"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/exactlylabs/radar/agent/internal/update"
	"google.golang.org/protobuf/proto"
)

func main() {
	binPath := flag.String("bin", "", "Path to the binary we will sign")
	keyPath := flag.String("key", "", "Path to private key of the certificate")
	certPath := flag.String("cert", "", "Path to the certificate")
	outputPath := flag.String("o", "signedBinary", "Output of the Signed Binary")
	flag.Parse()

	if *keyPath == "" || *certPath == "" || *binPath == "" {
		fmt.Println("-bin, -key and -cert are required arguments")
		os.Exit(1)
	}
	binary := loadFromPath(*binPath)
	key := loadKey(*keyPath)
	cert := loadFromPath(*certPath)
	signed := GenerateSignedBinary(binary, key, cert)
	data, err := proto.Marshal(signed)
	if err != nil {
		panic(err)
	}
	f, err := os.OpenFile(*outputPath, os.O_WRONLY|os.O_CREATE, 0755)
	if err != nil {
		panic(err)
	}
	f.Write(data)
	f.Close()
	fmt.Println("Signed Binary stored at ", *outputPath)
}

func loadKey(path string) *rsa.PrivateKey {
	data := loadFromPath(path)
	block, _ := pem.Decode(data)
	key, _ := x509.ParsePKCS1PrivateKey(block.Bytes)
	return key
}

func loadFromPath(path string) []byte {
	f, err := os.Open(path)
	if err != nil {
		panic(err)
	}
	data, err := ioutil.ReadAll(f)
	if err != nil {
		panic(err)
	}
	return data
}

func signBinary(binary []byte, pkey *rsa.PrivateKey) []byte {
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

type SignedBinary struct {
	Signature     []byte
	Certificate   []byte
	Binary        []byte
	HashAlgorithm int
}

func GenerateSignedBinary(binary []byte, pkey *rsa.PrivateKey, cert []byte) *update.SignedBinary {
	signature := signBinary(binary, pkey)
	s := &update.SignedBinary{}
	s.Signature = signature
	s.Certificate = cert
	s.Binary = binary
	fmt.Println(len(binary))
	return s
}
