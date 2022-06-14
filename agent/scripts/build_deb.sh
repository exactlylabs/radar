#!/usr/bin/env bash
#
# ----------------------------------------------------------------------- #
# Name: Build Debian Package
#
# Usage: ./build_deb.sh VERSION PKG_FILE_PATH ARCH
#
# Description: 
#   Builds DEB package for Radar Agent
#
#
# ----------------------------------------------------------------------- #

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
TARGET_RELEASE="stretch"
PKG_REVISION="1"
ARCH=$(go env GOARCH)
OUTPUT_PATH=${SCRIPT_DIR}/..
PKG_DIR=${SCRIPT_DIR}/../packaging/debian
DESTDIR=${PKG_DIR}/radar-agent

function help() {
    echo """
Build Debian Package

Usage: ./build_deb.sh [options] <VERSION>

Optional Arguments:
    -h | --help         Show this help message
    -a | --arch         Set the target architecture <default: ${ARCH}>
    -o | --output-path  Directory to output the .deb package <default: ${OUTPUT_PATH}>
    -p | --pkg-revision Set the revision of this package <default: ${PKG_REVISION}>
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
            DIST_DIR=$2
            shift
        ;;
        -p|--pkg-revision) 
            required $1 $2
            PKG_REVISION=$2
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

mkdir -p $DESTDIR/DEBIAN

# Generating the binary and installing it in the pkg directory
make -C ${SCRIPT_DIR}/.. build VERSION=${VERSION} ARCH=${ARCH}
make -C ${SCRIPT_DIR}/.. install DESTDIR=${DESTDIR}

# install the Systemd service
mkdir -p $DESTDIR/lib/systemd/system
cp ${PKG_DIR}/radar-agent.service $DESTDIR/lib/systemd/system

# GENERATING DEBIAN dir files
# Control File
VERSION=${VERSION} \
PKG_REVISION=${PKG_REVISION} \
ARCH=${ARCH} \
envsubst < ${PKG_DIR}/control > ${DESTDIR}/DEBIAN/control

# Pre/Post inst/rm scripts
cp ${PKG_DIR}/postinst ${DESTDIR}/DEBIAN/postinst
cp ${PKG_DIR}/postrm ${DESTDIR}/DEBIAN/postrm
cp ${PKG_DIR}/prerm ${DESTDIR}/DEBIAN/prerm

# Finalize with a checksum of the files in the pkg
svc_sum=($(md5sum ${DESTDIR}/lib/systemd/system/radar-agent.service))
bin_sum=($(md5sum ${DESTDIR}/usr/local/bin/radar-agent))
echo "${svc_sum} radar-agent.service" > ${DESTDIR}/DEBIAN/md5sums
echo "${bin_sum} radar-agent" >> ${DESTDIR}/DEBIAN/md5sums

# Now generate the pkg
dpkg-deb --build $DESTDIR $OUTPUT_PATH/radar-agent_${VERSION}-${PKG_REVISION}_${ARCH}.deb

rm -r $DESTDIR
