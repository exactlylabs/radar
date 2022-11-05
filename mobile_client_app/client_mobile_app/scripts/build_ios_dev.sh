#!/usr/bin/env bash
#
# Build and move to the workspace directory
#
#############################################
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

WORKSPACE=${SCRIPT_DIR}/../workspace
APPDIR=${SCRIPT_DIR}/..
BUILD=$(date +%s)
( cd ${APPDIR} && flutter build ios --build-number ${BUILD} --flavor dev -t lib/main_dev.dart --release --no-codesign )

# flutter build ipa -t lib/main_dev.dart --flavor dev --no-codesign --release
# This generates a .xcarchive file at build/ios/archive/Runner.xcarchive


mkdir -p ${WORKSPACE}/ios/dev
export VERSION_NAME=$(cat ${APPDIR}/pubspec.yaml | sed -ne 's/version: \([0-9]\+\.[0-9]\+\.[0-9]\+\)+[0-9]\+/\1/p')
cp -r ${APPDIR}/build/ios/iphoneos/Runner.app ${WORKSPACE}/ios/dev/Runner${VERSION}+${BUILD}.app
