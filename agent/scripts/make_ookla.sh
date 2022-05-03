#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
GOARCH=$(go env GOARCH)
GOOS=$(go env GOOS)
BIN_NAME="speedtest"
TARGET_NAME="ookla"

function help {
    echo "
Download Ookla binary and mount the needed files before building

Usage: make_ookla [OPTIONS]

Optional Arguments:
    -h | --help     Show this help message
    -a | --arch     Target Architecture to build. Default: "$ARCHITECTURE"
    -s | --os       Target Operational System. Default: "$OS"
"
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
        *) break
    esac
    shift
done

if [ $GOOS = "linux" ]; then
    if [ $GOARCH = "amd64" ]; then
        URL="https://install.speedtest.net/app/cli/ookla-speedtest-1.1.1-linux-x86_64.tgz"
        TARNAME="ookla-speedtest-1.1.1-linux-x86_64.tgz"

    elif [ $GOARCH = "386" ]; then
        URL="https://install.speedtest.net/app/cli/ookla-speedtest-1.1.1-linux-i386.tgz"
        TARNAME="ookla-speedtest-1.1.1-linux-i386.tgz"

    elif [ $GOARCH = "arm" ]; then
        URL="https://install.speedtest.net/app/cli/ookla-speedtest-1.1.1-linux-armhf.tgz"
        TARNAME="ookla-speedtest-1.1.1-linux-armhf.tgz"

    elif [ $GOARCH = "arm64" ]; then
        URL="https://install.speedtest.net/app/cli/ookla-speedtest-1.1.1-linux-aarch64.tgz"
        TARNAME="ookla-speedtest-1.1.1-linux-aarch64.tgz"

    fi

elif [ $GOOS = "windows" ]; then
    URL="https://install.speedtest.net/app/cli/ookla-speedtest-1.1.1-win64.zip"
    BIN_NAME="speedtest.exe"
    TARGET_NAME="ookla.exe"
    TARNAME="ookla-speedtest-1.1.1-win64.zip"

elif [ $GOOS = "darwin" ]; then
    URL="https://install.speedtest.net/app/cli/ookla-speedtest-1.1.1.84-macosx-x86_64.tgz"
    TARNAME="ookla-speedtest-1.1.1.84-macosx-x86_64.tgz"
fi

if [ -z URL ]; then
    echo "OS or Architecture not in the available list"
    exit 1
fi


mkdir ooklaSpeedTest
cd ooklaSpeedTest

wget $URL

if [ $(echo "${TARNAME##*.}") = "zip" ]; then
    unzip $TARNAME
else
    tar -xvf $TARNAME
fi

mv $BIN_NAME ../services/ookla/$TARGET_NAME

cd ..
rm -r ooklaSpeedTest
