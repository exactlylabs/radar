# Exactly Labs Certificates

> Attention, to make any of this work, you have to have access to our Certificates directory, and place it in `dist/certs`, otherwise it won't work.


## Note for Devs

If what you want is to generate a certificate for development purposes, see our Makefile instead, it will generate all development certs/keys for you.

## Certificates and Keys

This holds the current "Database" of certificates we have for the Radar Pods Project and our own Root CA

All configurations are put inside `prod_root_ca.cnf`, this file manages everything related to the certificates generation.

The `dist/certs` directory holds all generated certificates, including revoked ones.




Certificates and keys live inside `dist/certs` directory. If you need to generate a new certificate for binary signing, use `./gen_cert.sh`, and it will replace the existing cert + keys inside `dist/certs`.

## Procedure to when the Signing Certificate key leaks

In the event of a leak, you have to revoke the existing certificate, by calling

```sh
./crl_tools.sh revoke <path_to_cert>
```

This will add the certificate to the list of revoked certificates, and generate a new CRL, that you need to upload to our [Storage](https://console.cloud.google.com/storage/browser/radar.exactlylabs.com;tab=objects?forceOnBucketsSortingFiltering=true&authuser=1&project=ttac-prod&prefix=&forceOnObjectsSortingFiltering=false) in order for the pods to know that the certificate got revoked.


## Certificate Revokation List (CRL)

When updating, a pod will download our binary along with a certificate that has signed it. Prior to validating the signature and certificate, it first downloads the CRL from our [Storage](https://storage.googleapis.com/radar.exactlylabs.com/rootCRL.crl.pem), to make sure that the certificate that generated it isn't revoked.

Given the CRL expires in 180 days (configured in prod_root_ca.cnf), it should be renewed by calling

```sh
./crl_tools.sh renew
```

If you call it in the root directory (where this README lives), you don't need to add any paths, and it will output where the new CRL was inserted. Make sure to upload it to the storage, so the pods can get it whenever an update is available and they need to validate the downloaded binary.


