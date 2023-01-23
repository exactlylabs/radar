#!/usr/bin/env bash


set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

function print_usage() {
    echo "Usage: ./crl_tools COMMAND [...ARGS]"
    echo "Script to help with dealing with the certificate revocation list"
    echo "Commands:"
    echo "* renew: Generate a new CRL, with a new expiration"
    echo "* revoke <filepath>: Revoke the given certificate"
}

if [ -z $1 ]; then
    echo "Error: You need to provide a command"
    print_usage
fi

function renew() {
    openssl ca -config $SCRIPT_DIR/prod_root_ca.cnf -gencrl -out $SCRIPT_DIR/../dist/certs/rootCRL.crl.pem
    echo "CRL generated at $SCRIPT_DIR/../dist/certs/rootCRL.crl.pem"
}

function revoke() {
    openssl ca -config $SCRIPT_DIR/prod_root_ca.cnf -revoke $1
    renew
}

if [ $1 == "renew" ]; then
    renew

elif [ $1 == "revoke" ]; then 
    if [ -z $2 ]; then
        echo "Error: revoke command requires a path to the certificate to revoke"
    fi
    revoke $2
else
    echo "Error: invalid command"
    print_usage
fi
