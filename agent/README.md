# Agent 


## Objective

The agent service will function as a service that continually communicates with the web service to reconfigure itself as well as to notify that the agent is active.

Additionally, it schedules automatic tests and has the ability to do a self update, validating with a signed binary.

### Build

Bellow are the steps to build the Agent

#### ROOT Certificate (CA)

We use a CA Certificate to ensure that any incomming binary update is safe to replace the current running binary. To avoid having to install the certificate, it is embeded into the binary and therefore we need to add it to the project before building.


Before building the agent, you must first add a `rootCA.pem` CA certificate at `./internal/update/rootCA.pem`. 

>You can create a certificate Authority by calling `./scripts/gen_root_ca.sh`

#### Build and Sign

After all required steps are done, call `./scripts/build_and_sign.sh`

Example: (call `./scripts/build_and_sign.sh -h` for more information)

```sh
./scripts/build_and_sign.sh \
    -o dist/agent \
    1.0.0\
    cmd/signing/binCert.crt\
    cmd/signing/binKey.key
```
