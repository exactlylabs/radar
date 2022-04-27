#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

mkdir -p $SCRIPT_DIR/../dist/certs/

# Generate the Private Key -- For production, this must be kept in a safe place
openssl genrsa -out $SCRIPT_DIR/../dist/certs/rootCA.key 2048

openssl req -x509 -new -nodes -key $SCRIPT_DIR/../dist/certs/rootCA.key -sha256 -out $SCRIPT_DIR/../dist/certs/rootCA.pem

cp $SCRIPT_DIR/../dist/certs/rootCA.pem $SCRIPT_DIR/../internal/update/rootCA.pem
echo ""
echo "Finished Generating a new Certificate Authority"
echo "$SCRIPT_DIR/../dist/certs/rootCA.pem"
echo "$SCRIPT_DIR/../dist/certs/rootCA.key"
