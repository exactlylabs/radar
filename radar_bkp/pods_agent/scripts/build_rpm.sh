#!/usr/bin/env bash
#
# ----------------------------------------------------------------------- #
# Name: Build RPM Package
#
# Usage: ./build_rpm.sh VERSION
#
# Description: 
#   Builds RPM package for Radar Agent
#
#
# ----------------------------------------------------------------------- #


# Builds RPM package for Radar Agent

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ARCH=$(go env GOARCH)
OUTPUT_PATH=${SCRIPT_DIR}/..
PKG_DIR=${SCRIPT_DIR}/../packaging/rpmbuild

function help() {
    echo """
Build RPM Package

Usage: ./build_rpm.sh [options] <VERSION>

Optional Arguments:
    -h | --help         Show this help message
    -a | --arch         Set the target architecture <default: ${ARCH}>
    -o | --output-path  Directory to output the .rpm package <default: ${OUTPUT_PATH}>
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
        -a|--arch) 
            required $1 $2
            ARCH=$2
            shift
        ;;
        -o|--output-path) 
            required $1 $2
            OUTPUT_PATH=$2
            shift
        ;;
        *) break
    esac
    shift
done

if [ -z $(command -v rpmbuild) ]; then
  echo Error: RPM package is not installed
  exit 1
fi
if [ $# -lt 1 ]; then
  echo "Error: missing paramenters"
  exit 1
fi
VERSION=$1

# Copy rpmbuild package to home (this appears to be necessary)
cp -r ${PKG_DIR} ~
VERSION=$VERSION \
envsubst < ${PKG_DIR}/SPECS/radar-agent.spec > ~/rpmbuild/SPECS/radar-agent.spec

mkdir -p ~/rpmbuild/SOURCES/radar-agent-${VERSION}
# Call build for the specified package from the environment variables
make -C ${SCRIPT_DIR}/.. build BIN_NAME=radar-agent OUTPUT_DIR=~/rpmbuild/SOURCES/radar-agent-${VERSION}

# Move the .service to the final package directory
cp ~/rpmbuild/SOURCES/radar-agent.service ~/rpmbuild/SOURCES/radar-agent-${VERSION}

# create a tarball
cd ~/rpmbuild/SOURCES/
tar -czvf radar-agent-${VERSION}.tar.gz radar-agent-${VERSION}

# Now build the RPM package
TARGET=${ARCH}
if [ $TARGET == "arm64" ]; then
  TARGET="aarch64"
elif [ $TARGET == "amd64" ]; then
  TARGET="x86_64"
fi

rpmbuild -ba --target=${TARGET} ~/rpmbuild/SPECS/radar-agent.spec

mkdir -p ${OUTPUT_PATH}
mv ~/rpmbuild/RPMS/${TARGET}/*.rpm ${OUTPUT_PATH}
