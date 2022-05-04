# Agent 


## Objective

The agent service will function as a service that continually communicates with the web service to reconfigure itself as well as to notify that the agent is active.

Additionally, it schedules automatic tests and has the ability to do a self update, validating with a signed binary.

### Setup

> Make sure you are at agent directory to follow the instructions bellow

#### Ookla Binary

To setup the project, you need to download an ookla binary for you current OS/Architecture (Or the one you are targeting your build) by calling `./scripts/make_ookla.sh`. You can also find the available binaries [here](https://www.speedtest.net/pt/apps/cli).

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
        - binary.go
        - ookla
        - ookla.go
        ...

#### Developer Environment

By default, the application will run in development mode if you are running through `go run ...`.
In case you want to generate a binary in development mode, go to the **Build** section and use "Dev" as the version number.

When in development mode, the application will generate a configuration file with Development configurations locatet at `config/dev.go`

> To run just as a developer, without building, you just need to complete the ROOT Certificate (CA) step bellow.


### Build

Bellow are the steps to build the Agent

#### ROOT Certificate (CA)

We use a CA Certificate to ensure that any incomming binary update is safe to replace the current running binary. To avoid having to install the certificate, it is embeded into the binary and therefore we need to add it to the project before building.


Before building the agent, you must first add a `rootCA.pem` CA certificate at `./internal/update/rootCA.pem`. 

>You can create a certificate Authority by calling `./scripts/gen_root_ca.sh`. It will automatically copy the certificate to the correct path. **Make sure to store this in a safe location for production**

#### Provider Certificate

For the binary distribution, we need a new certificate, generated through our newly created CA. This is the certificate we will use to sign our binaries and the one that the application checks agains the rootCA embedded on it to make sure it's signed by that CA.

> You can create a provider certificate by calling `./scripts/gen_cert.sh`. It will automatically generate a binCert.crt (the certificate) and a binKey.key (private key). Again, make sure to store it in a safe place.



#### Build and Sign

After all required steps are done, we can build and sign the binary through `build_and_sign.sh`


It defaults to create a binary for your current system. In case you want a different configuration, just add `--arch` and/or `--os` flags, giving the value you want.

Available architectures / operational system can be found through

```sh
go tool dist list
```

> It's important to remember that the ookla binary build should be for the target OS/Architecture

Run this code to see the usage
```
./scripts/build_and_sign -h
```

If you followed the steps above, this example should create the binary and signed binary:

```sh
./scripts/build_and_sign.sh \
    -o dist/agent \
    1.0.0\
    dist/certs/binCert.crt\
    dist/certs/binKey.key

ls dist/
```

Since the signed binary is not an actual executable, the script also creates a binary to internal usage/tests.

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
It will check and if the binary is a valid one, it generates the `usigned_agent`, that will work just like the original `agent` binary.


### Upgrading the Binary

At every status notification (Ping), the server might return to the application a new version to be upgraded

The application does that by going to the specified URL and downloading the signed binary, then validating it and if everything is valid, it replaces the current binary with the new one.

This functionality only works when the application Version **is not Dev**. This is also intended to be used in a builted binary, not through `go run ...`, as it's expected to replace the current application file.

If you wish to learn more about how to configure the running pod to be upgraded, check out the Server README for more.

### Signed Binary Protobuf File

If you modify the .proto file, you can generate the new .go file by calling at the same directory as the `go.mod` file is
```sh
protoc -I=. --go_out=. ./internal/update/signedBinary.proto
```

Since the signed binary is not an actual executable, the script also creates a binary to internal usage/tests.

At the end, you should have the following files:

- dist/
    - agent
    - agent_signed

Running the agent binary is as simple as: `./dist/agent` or `ENVIRONMENT=DEV ./dist/agent` if you wish to run in development mode.


#### Validating the Binary

In case you wish to validate the binary, to make sure it's correctly working, use the cmd cli for that:

```sh
go run cmd/validate/main.go -bin dist/agent_signed -o dist/unsigned_agent
```
It will check and if the binary is a valid one, it generates the `usigned_agent`, that will work just like the original `agent` binary.


### Upgrading the Binary

At every status notification (Ping), the server might return to the application a new version to be upgraded

The application does that by going to the specified URL and downloading the signed binary, then validating it and if everything is valid, it replaces the current binary with the new one.

This functionality only works when the application Version **is not Dev**. This is also intended to be used in a builted binary, not through `go run ...`, as it's expected to replace the current application file.

If you wish to learn more about how to configure the running pod to be upgraded, check out the Server README for more.

### Signed Binary Protobuf File

If you modify the .proto file, you can generate the new .go file by calling at the same directory as the `go.mod` file is
```sh
protoc -I=. --go_out=. ./internal/update/signedBinary.proto
```

Since the signed binary is not an actual executable, the script also creates a binary to internal usage/tests.

At the end, you should have the following files:

- dist/
    - agent
    - agent_signed

Running the agent binary is as simple as: `./dist/agent` or `ENVIRONMENT=DEV ./dist/agent` if you wish to run in development mode.


#### Validating the Binary

In case you wish to validate the binary, to make sure it's correctly working, use the cmd cli for that:

```sh
go run cmd/validate/main.go -bin dist/agent_signed -o dist/unsigned_agent
```
It will check and if the binary is a valid one, it generates the `usigned_agent`, that will work just like the original `agent` binary.


