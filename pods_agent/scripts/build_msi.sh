#!/usr/bin/env bash
#
# ----------------------------------------------------------------------- #
# Name: Build Windows MSI Package
#
# Usage: ./build_msi.sh VERSION
#
# Description: 
#   Builds .msi package for Radar Agent
#
#
# ----------------------------------------------------------------------- #


# Creates a .msi package for windows
# Requires: msitools

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PACKAGE_DIR=$SCRIPT_DIR/../packaging/windows
DESTDIR=$PACKAGE_DIR/_build
OUTPUT_PATH=$SCRIPT_DIR/..

function help() {
    echo """
Build Windows MSI Package

Usage: ./build_msi.sh [options] <VERSION>

Optional Arguments:
    -h | --help         Show this help message
    -o | --output-path  Directory to output the .deb package <default: ${OUTPUT_PATH}>
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
        -o|--output-path) 
            required $1 $2
            OUTPUT_PATH=$2
            shift
        ;;
        *) break
    esac
    shift
done

if [ $# -lt 1 ]; then
  echo "Error: missing paramenters"
  exit 1
fi
VERSION=$1

rm -rf ${DESTDIR}
mkdir -p ${DESTDIR}

# We only support amd64 for windows, due to ookla
make build VERSION=${VERSION} OS=windows ARCH=amd64 BIN_NAME=radar-agent-unsigned.exe OUTPUT_DIR=${DESTDIR}

osslsigncode sign -certs ${SIGNING_CERT_FILE} -key ${SIGNING_KEY_FILE} \
    -n "Radar Agent" -i https://radar.exactlylabs.com/ \
    -t http://timestamp.digicert.com \
    -in ${DESTDIR}/radar-agent-unsigned.exe -out ${DESTDIR}/radar-agent.exe



cp ${PACKAGE_DIR}/RadarAgent.wxs ${DESTDIR}
sed -i 's/${VERSION}/'${VERSION}'/g' ${DESTDIR}/RadarAgent.wxs

# Now generate the .msi file
mkdir -p ${OUTPUT_PATH}
wixl -a x64 -o ${DESTDIR}/RadarAgent-unsigned.msi ${DESTDIR}/RadarAgent.wxs

rm -f ${OUTPUT_PATH}/RadarAgent.msi
osslsigncode sign -certs ${SIGNING_CERT_FILE} -key ${SIGNING_KEY_FILE} \
    -n "Radar Agent Installer" -i https://radar.exactlylabs.com/ \
    -t http://timestamp.digicert.com \
    -in ${DESTDIR}/RadarAgent-unsigned.msi -out ${OUTPUT_PATH}/RadarAgent.msi

echo "Generated msi file at ${OUTPUT_PATH}/RadarAgent.msi"

rm -rf ${DESTDIR}
