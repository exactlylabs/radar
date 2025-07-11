#!/bin/bash
#
# ----------------------------------------------------------------------- #
# Name: Build a Golang application
#
# Description:
#   Build the target golang application
#   with a specified version and OS/Architecture
#
# ----------------------------------------------------------------------- #

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
BUILD_PROJECT=cmd/start_agent/main.go
OUTPUT_FILE="./dist/radar_agent"
GOARCH=$(go env GOARCH)
GOOS=$(go env GOOS)
GOARM=""
TAGS=""


function help() {
    echo """
Build and Sign the Go Agent

Usage: ./build_agent.sh [options] <version>

Optional Arguments:
    -h | --help     Show this help message
    -o | --output   Where to output the binary. Defaults:  "$OUTPUT_FILE"
    -a | --arch     Target Architecture to build. Default: "$ARCHITECTURE"
    -s | --os       Target Operational System. Default: "$OS"
    -r | --arm      Arm Version, according to https://github.com/golang/go/wiki/GoArm. Default: ""
    -p | --project  Target to the Go Project we are building. Default: $BUILD_PROJECT
    -t | --tags     Build Tags. Default: "${TAGS}"
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
        -r|--arm)
            required $1 $2
            GOARM=$2
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
        -t|--tags)
            TAGS=$2
            shift
        ;;
        *) break
    esac
    shift
done

if [[ -z $1 ]]; then
    echo "ERROR: missing required arguments"
    help
fi

VERSION=$1

COMMIT=$(git rev-list -1 HEAD)
BUILT_AT=$(date +"%Y%m%d%H%M")

DISTRIBUTION="$GOOS-$GOARCH"

if [ $GOARCH = "arm" ]; then
    DISTRIBUTION="${BUILD}v${GOARM}"
fi

echo "Building $OUTPUT_FILE for $DISTRIBUTION "
echo "Version: $VERSION"
echo "Commit: $COMMIT"

echo "Building Ookla binary"
$SCRIPT_DIR/make_ookla.sh -s $GOOS -a $GOARCH

LDFLAGS="-s -X 'github.com/exactlylabs/radar/pods_agent/internal/info.version=$VERSION'
-X 'github.com/exactlylabs/radar/pods_agent/internal/info.commit=$COMMIT'
-X 'github.com/exactlylabs/radar/pods_agent/internal/info.builtAt=$BUILT_AT'
-X 'github.com/exactlylabs/radar/pods_agent/internal/info.distribution=$DISTRIBUTION'"

# Go to module root directory
cd $SCRIPT_DIR/..
GOARM=$GOARM GOOS=$GOOS GOARCH=$GOARCH go build -o $OUTPUT_FILE -tags="$TAGS" -ldflags="$LDFLAGS" $BUILD_PROJECT

echo "------"
echo ""
echo "Finished Build of $BUILD_PROJECT"
echo "Architecture: $GOARCH $GOARM"
echo "OS: $GOOS"
echo "Version: $VERSION"
echo "Commit: $COMMIT"
echo "Build At: $BUILT_AT"
echo "Distribution: $DISTRIBUTION"
echo "Tags: $TAGS"
echo "Output: $OUTPUT_FILE"
echo ""
echo "------"
