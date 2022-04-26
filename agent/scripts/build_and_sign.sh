#!/bin/bash
#
# ----------------------------------------------------------------------- #
# Name: Build and Sign
# Description: 
#   Build the target golang application and then call
#   the signing cmd tool at cmd/signing/main.go to generate a file
#   containing the binary, a signature and a certificate of the signer
#
# ----------------------------------------------------------------------- #

set -e

BUILD_PROJECT=cmd/start_agent/main.go
OUTPUT_FILE="./dist/radar_agent"
GOARCH=$(go env GOARCH)
GOOS=$(go env GOOS)


function help() {
    echo """
Build and Sign the Go Agent

Usage: ./build_and_sign.sh [options] <version> <certPath> <keyPath>

Optional Arguments:
    -h | --help     Show this help message
    -o | --output   Where to output the binary. Defaults:  "$OUTPUT_FILE"
    -a | --arch     Target Architecture to build. Default: "$ARCHITECTURE"
    -s | --os       Target Operational System. Default: "$OS"
    -p | --project  Target to the Go Project we are building. Default: $BUILD_PROJECT
"""
}

function required() {
    if [ -z $2 ]; then
        echo "ERROR: $1 requires a non-empty option argument"
        exit 1
    fi
}

while :; do
    case $1 in
        -h|--help)
            help
            exit 0
        ;;
        -o|--output) 
            required $1 $2
            OUTPUT_FILE=$2
            shift
        ;;
        -a|--arch)
            required $1 $2
            GOARCH=$2
            shift
        ;;
        -s|--os)
            required $1 $2
            GOOS=$2
            shift
        ;;
        -p|--project)
            required $1 $2
            BUILD_PROJECT=$2
            shift
        ;;
        *) break
    esac
    shift
done

if [[ -z $1  ||  -z $2  ||  -z $3 ]]; then
    echo "ERROR: missing required arguments"
    help
fi

VERSION=$1
CERT_PATH=$2
KEY_PATH=$3

COMMIT=$(git rev-list -1 HEAD)
BUILT=$(date +"%Y%m%d%H%M")

echo "Building $OUTPUT_FILE for $GOOS - $GOARCH "
echo "Version: $1"
echo "Commit: $COMMIT"


LDFLAGS="-s -X 'github.com/exactlylabs/radar/agent/internal/info.version=$VERSION' -X 'github.com/exactlylabs/radar/agent/internal/info.commit=$COMMIT' -X 'github.com/exactlylabs/radar/agent/internal/info.builtAt=$BUILT'"

GOOS=$GOOS GOARCH=$GOARCH go build -o $OUTPUT_FILE -ldflags="$LDFLAGS" $BUILD_PROJECT

echo "------"
echo ""
echo "Finished Build of $BUILD_PROJECT"
echo "Architecture: $GOARCH"
echo "OS: $GOOS"
echo "Version: $1"
echo "Commit: $COMMIT"
echo "BUILT: $BUILT"
echo "Output: $OUTPUT_FILE"
echo ""
echo "------"


echo "Signing Binary"

go run cmd/signing/main.go -bin $OUTPUT_FILE -key $KEY_PATH -cert $CERT_PATH -o "$OUTPUT_FILE"_signed

echo "Signed File generated at "$OUTPUT_FILE"_signed"
