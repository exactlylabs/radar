#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

mkdir -p $SCRIPT_DIR/../dist/certs/

# Create Private Key
openssl genrsa -out $SCRIPT_DIR/../dist/certs/binKey.key 2048

# Create Certification Signing Request
if [ -z $CERT_CONFIG ]; then
    openssl req -new -key $SCRIPT_DIR/../dist/certs/binKey.key -out $SCRIPT_DIR/../dist/certs/binCert.csr
else
    openssl req -new -config $CERT_CONFIG -key $SCRIPT_DIR/../dist/certs/binKey.key -out $SCRIPT_DIR/../dist/certs/binCert.csr
fi

# Now, we create the certificate, using the CSR and the Root CA private key and the Root CA
openssl x509 -req -in $SCRIPT_DIR/../dist/certs/binCert.csr -CA $SCRIPT_DIR/../dist/certs/rootCA.pem -CAkey $SCRIPT_DIR/../dist/certs/rootCA.key \
    -CAcreateserial -out $SCRIPT_DIR/../dist/certs/binCert.crt -days 1800 -sha256 -extfile $SCRIPT_DIR/binExtensionConfig.ext

if [ -z $DEV ]; then
    # Register this certificate into the certs database (usually index.txt)
    # Only makes sense if in Production
    touch ./dist/certs/index.txt
    openssl ca -config prod_root_ca.cnf -valid $SCRIPT_DIR/../dist/certs/binCert.crt
    openssl ca -config prod_root_ca.cnf -gencrl -out $SCRIPT_DIR/../dist/certs/rootCRL.crl.pem
fi

rm $SCRIPT_DIR/../dist/certs/binCert.csr
rm $SCRIPT_DIR/../dist/certs/rootCA.srl


echo "Finished Generating Provider Certificates"
echo "$SCRIPT_DIR/../dist/certs/binCert.crt"
echo "$SCRIPT_DIR/../dist/certs/binKey.key"
