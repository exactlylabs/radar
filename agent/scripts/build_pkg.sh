#!/usr/bin/env bash

# Commands and files took from: https://vincent.bernat.ch/en/blog/2013-autoconf-osx-packaging

set -e

# Builds MacOS .pkg file

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PACKAGE_DIR=$SCRIPT_DIR/../packaging/mac
DESTDIR=$PACKAGE_DIR/_build
OUTPUT_DIR=$SCRIPT_DIR/..

rm -rf $DESTDIR

mkdir -p $DESTDIR
mkdir -p $DESTDIR/pkg/usr/local/bin/

# Build binary for both amd64 and arm64, then create an universal binary
make build ARCH=amd64 BIN_NAME=radar-agent_amd64 OUTPUT_DIR=$DESTDIR
make build ARCH=arm64 BIN_NAME=radar-agent_arm64 OUTPUT_DIR=$DESTDIR

lipo -create -output $DESTDIR/pkg/usr/local/bin/radar-agent $DESTDIR/radar-agent_amd64 $DESTDIR/radar-agent_arm64

# TODO: This might not be needed for the CI?
#       but locally, it fails if not unlocked at every session.
security unlock-keychain login.keychain

echo $DESTDIR/pkg/usr/local/bin/radar-agent
# Sign the binary

codesign \
    -s ${APPLICATION_CERT_ID} \
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



# Now, build the product, with build scripts + resources, as the final .pkg file
productbuild \
    --distribution $DESTDIR/distribution.xml \
    --resources $DESTDIR/resources \
    --package-path $DESTDIR \
    --version ${VERSION} \
    --sign "${INSTALLER_CERT_ID}" \
    $OUTPUT_DIR/radar-agent_${VERSION}.pkg

rm -rf $DESTDIR
