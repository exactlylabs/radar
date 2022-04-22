#!/bin/bash


# Create Private Key
openssl genrsa -out binKey.key 2048

# Create Certification Signing Request
openssl req -new -key binKey.key -out binCert.csr

# Now, we create the certificate, using the CSR and the Root CA private key and the Root CA
openssl x509 -req -in binCert.csr -CA rootCA.pem -CAkey rootCA.key \
    -CAcreateserial -out binCert.crt -days 1800 -sha256 -extfile binExtensionConfig.ext
