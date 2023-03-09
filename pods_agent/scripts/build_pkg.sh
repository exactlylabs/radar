#!/usr/bin/env bash
#
# ----------------------------------------------------------------------- #
# Name: Build MacOS PKG Package
#
# Usage: ./build_pkg.sh VERSION
#
# Description: 
#   Builds .pkg package for Radar Agent
#
#
# ----------------------------------------------------------------------- #

set -e

###### BUILD BINARY STEPS ######

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PACKAGE_DIR=$SCRIPT_DIR/../packaging/mac
DESTDIR=$PACKAGE_DIR/_build
OUTPUT_PATH=$SCRIPT_DIR/..

function help() {
    echo """
Build MacOS PKG Package

Usage: ./build_pkg.sh [options] <VERSION>

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


rm -rf $DESTDIR

mkdir -p $DESTDIR
mkdir -p $DESTDIR/pkg/usr/local/bin/

# Build binary for both amd64 and arm64, then create an universal binary
make build ARCH=amd64 BIN_NAME=radar-agent_amd64 OUTPUT_DIR=$DESTDIR
make build ARCH=arm64 BIN_NAME=radar-agent_arm64 OUTPUT_DIR=$DESTDIR

lipo -create -output $DESTDIR/pkg/usr/local/bin/radar-agent $DESTDIR/radar-agent_amd64 $DESTDIR/radar-agent_arm64
rm $DESTDIR/radar-agent_amd64
rm $DESTDIR/radar-agent_arm64


###### SIGNING + PKG CREATION STEPS ######

#### Setup KeyChain ####
# Code took from: https://stackoverflow.com/questions/16550594/jenkins-xcode-build-works-codesign-fails

MY_KEYCHAIN="RadarKeyChain.keychain"
security create-keychain -p "" "$MY_KEYCHAIN"
security list-keychains -d user -s "$MY_KEYCHAIN" $(security list-keychains -d user | sed s/\"//g)
security set-keychain-settings "$MY_KEYCHAIN"
security unlock-keychain -p "" "$MY_KEYCHAIN"

security import $APP_P12_FILE_PATH -k "$MY_KEYCHAIN" -P "" -T "/usr/bin/codesign" -T "/usr/bin/productbuild"
security import $APP_CERT_FILE_PATH -k "$MY_KEYCHAIN" -P "" -T "/usr/bin/codesign" -T "/usr/bin/productbuild"

security import $INSTALLER_P12_FILE_PATH -k "$MY_KEYCHAIN" -P "" -T "/usr/bin/codesign" -T "/usr/bin/productbuild"
security import $INSTALLER_CERT_FILE_PATH -k "$MY_KEYCHAIN" -P "" -T "/usr/bin/codesign" -T "/usr/bin/productbuild"


security set-key-partition-list -S apple-tool:,apple: -s -k "" $MY_KEYCHAIN

#### Creating the PKG ####
# Commands and files took from: https://vincent.bernat.ch/en/blog/2013-autoconf-osx-packaging

# Sign the binary
codesign \
    -s "Developer ID Application: Exactly Labs, Inc. (MQYTP6VS48)" \
    -fv \
    --options runtime \
    --timestamp \
    $DESTDIR/pkg/usr/local/bin/radar-agent


# Copy launchd file
mkdir -p $DESTDIR/pkg/Library/LaunchDaemons/
cp $PACKAGE_DIR/com.exactlylabs.radar.agent.plist $DESTDIR/pkg/Library/LaunchDaemons/

cp -r $PACKAGE_DIR/resources $DESTDIR
cp -r $PACKAGE_DIR/scripts $DESTDIR
VERSION=${VERSION} \
envsubst < $PACKAGE_DIR/distribution.xml > $DESTDIR/distribution.xml

# Generate the bundle with all files to be copied
pkgbuild \
    --root $DESTDIR/pkg \
    --identifier com.exactlylabs.radar.agent \
    --version ${VERSION} \
    --scripts $DESTDIR/scripts \
    $DESTDIR/agent_pkg.pkg 

mkdir -p $OUTPUT_PATH

# Now, build the product, with build scripts + resources, as the final .pkg file
productbuild \
    --distribution $DESTDIR/distribution.xml \
    --resources $DESTDIR/resources \
    --package-path $DESTDIR \
    --version ${VERSION} \
    --sign "Developer ID Installer: Exactly Labs, Inc. (MQYTP6VS48)" \
    $OUTPUT_PATH/radar-agent_${VERSION}.pkg

rm -rf $DESTDIR

# Finish deleting the keychain that was created
security delete-keychain "$MY_KEYCHAIN"
