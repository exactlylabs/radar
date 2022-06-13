#!/usr/bin/env bash

# Creates a .msi package for windows
# Requires: msitools

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PACKAGE_DIR=$SCRIPT_DIR/../packaging/windows
DESTDIR=$PACKAGE_DIR/_build
if [ -z OUTPUT_DIR ]; then
  OUTPUT_DIR=$SCRIPT_DIR/..
fi

if [ -z $VERSION ]; then
  VERSION="1.0.0"
fi

# We only support amd64 for windows, due to ookla
make build VERSION=$VERSION OS=windows ARCH=amd64 BIN_NAME=radar-agent.exe OUTPUT_DIR=$DESTDIR

mkdir -p $DESTDIR

cp $PACKAGE_DIR/RadarAgent.wxs $DESTDIR
sed -i 's/${VERSION}/'$VERSION'/g' $DESTDIR/RadarAgent.wxs

# Now generate the .msi file
mkdir -p $OUTPUT_DIR
wixl -a x64 -o $OUTPUT_DIR/RadarAgent.msi $DESTDIR/RadarAgent.wxs

echo "Generated msi file at $OUTPUT_DIR/RadarAgent.msi"

rm -r $DESTDIR
