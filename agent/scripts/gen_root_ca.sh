#!/bin/bash


# Generate the Private Key -- For production, this must be kept in a safe place
openssl genrsa -out rootCA.key 2048

openssl req -x509 -new -nodes -key rootCA.key -sha256 -out rootCA.pem
