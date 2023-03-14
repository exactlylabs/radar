# Agent 


## Objective

The agent service will function as a service that continually communicates with the web service to reconfigure itself as well as to notify that the agent is active.

Additionally, it schedules automatic tests and has the ability to do a self update, validating with a signed binary.

### Setup

> Make sure you are at agent directory to follow the instructions bellow

> If you wish to setup a **developer** environment, just run `make dev` and it will make all setup steps bellow.


#### Ookla Binary

To setup the project, you need to download an ookla binary for your current OS/Architecture (Or the one you are targeting your build) by calling `./scripts/make_ookla.sh`. You can also find the available binaries [here](https://www.speedtest.net/pt/apps/cli).

To use it, just call:

```sh
./scripts/make_ookla.sh
```

If you need to compile for another target OS and/or Architecture, call
```
./scripts/make_ookla.sh --os <GOOS VALUE> --arch <GOARCH VALUE> --arm <GOARM VALUE (optional)>
```
At the end, you should have something simillar to this:

* services/
    - ookla/
        - ookla
        - ookla.go
        ...

#### Developer Environment

By default, the application will run in development mode if you are running through `make run`.
In case you want to generate a binary in development mode, go to the **Build** section and use "Dev" as the version number.

When in development mode, the application will generate a configuration file with Development configurations located at `config/dev.go`

> To run just as a developer, without building, you just need to complete the ROOT Certificate (CA) step bellow.


### Build

Bellow are the steps to build the Agent

#### ROOT Certificate (CA)

We use a CA Certificate to ensure that any incomming binary update is safe to replace the current running binary. To avoid having to install the certificate, it is embeded into the binary and therefore we need to add it to the project before building.


Before building the agent, you must first add a `rootCA.pem` CA certificate at `./internal/update/rootCA.pem`. 

>You can create a Certificate Authority by calling `./scripts/gen_root_ca.sh`. It will automatically copy the certificate to the correct path. **Make sure to store this in a safe location for production**

#### Provider Certificate

For the binary distribution, we need a new certificate, generated through our newly created CA. This is the certificate we will use to sign our binaries and the one that the application checks against the rootCA embedded on it to make sure it's signed by that CA.

> You can create a provider certificate by calling `./scripts/gen_cert.sh`. It will automatically generate a binCert.crt (the certificate) and a binKey.key (private key). Again, make sure to store it in a safe place and **in a location other than where the CA certificate is located**.



#### Build and Sign

After all required steps are done, we can build and sign the binary through `make all [OPTIONS]`

It defaults to create a binary for your current system, in **DEV** mode. In case you want a different configuration, just set the env variables `ARCH` and/or `OS`, giving the value you want.

eg: `make all VERSION=1.0.0 OS=linux ARCH=amd64`

Available architectures / operational system can be found through

```sh
go tool dist list
```

> It's important to remember that the ookla binary build should be for the target OS/Architecture

If you followed the steps above running `make all` should create the binary and signed binary at `dist/` directory:

At the end, you should have the following files:

- dist/
    - agent
    - agent_signed

Running the agent binary is as simple as: `./dist/agent`


#### Validating the Binary

In case you wish to validate the binary, to make sure it's correctly working, use the cmd cli for that:

```sh
go run cmd/validate/main.go -bin dist/agent_signed -o dist/unsigned_agent
```
It will check and if the binary is a valid one and generate the `usigned_agent`, that will work just like the original `agent` binary.


### Upgrading the Binary

At every status notification (Ping), the server might return to the application a new version to be upgraded

The application does that by going to the specified URL and downloading the signed binary, then validating it and if everything is valid, it replaces the current binary with the new one.

This functionality only works when the application Version **is not Dev**. This is also intended to be used in a built binary, not through `go run ...`, as it's expected to replace the current application file.

If you wish to learn more about how to configure the running pod to be upgraded, check out the Server README for more.

### Signed Binary Protobuf File

If you modify the .proto file, you can generate the new .go file by calling at the same directory as the `go.mod` file is
```sh
protoc -I=. --go_out=. ./internal/update/signedBinary.proto
```

### Building Packages

We support creating packages for the following:

* Debian `.deb` packages: `make deb`
* Fedora `.rpm` packages: `make rpm`
* Windows `.msi` packages: `make msi` (using linux for creating the package. Also needs signing keys. Check `./scripts/build_msi.sh`)
* Apple `.pkg` packages: `make pkg` (can only be called on OSx and also needs signing keys for it. Check `./scripts/build_pkg.sh`)

#### Apple Notarization

Since apple needs to validate our binary before enabling it to be downloaded without warnings, you also have to call `./scripts/notarize_pkg.sh`. See the file for more information on how to use it.


### Certificate Revocation List

If for some reason our binary signer certificate (for the self-update only) is compromised, it is possible to revoke it. The revocation works adding that certificate to a CRL (Certificate Revocation List). The CRL will have mapped in it all certificates that we've revoked so far.

It is important to make sure that we are only revoking certificates created by our `./scripts/gen_cert.sh` script, because it adds the newly created certificate to the certificates database, usually called `index.txt`. When revoking, the program will look for it there.

#### Revoking a Certificate

To revoke a certificate, you can use our utility tool:

`./scripts/crl_tools.sh revoke <path_to_certificate>`

This script will revoke the given certificate, if it exists in the list of valid certificates in the database and will also generate a new `.crl.pem` file -- This is the CRL file that you need to make available to all pods.

#### Updating the CRL in the Cloud

Just generating the CRL is not enough, we need to place it somewhere where all pods can have access. Currently, we are using GCP Storage, in the same bucket as our public files from radar server: `https://storage.googleapis.com/radar.exactlylabs.com/rootCRL.crl.pem`. So whenever you update the CRL, go and upload it to this bucket, replacing the old one. Once you do this, all pods will be able to reject this certificate that you have revoked.

#### Renewing the CRL

CRLs have an expiration time. Once you reach it, the agent will no longer consider it safe and throw an error -- This error is going to be sent to sentry, so we can take action and renew it.

To renew the certificate, call: 

`./scripts/crl_tools.sh renew`

It will generate a new CRL file and you go and upload it to the storage, the same way as in the step above.


> The default expiration time is set to 30 days.
