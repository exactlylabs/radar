#!/usr/bin/env bash
#
# Build and move to the workspace directory
#
#############################################
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
FLAVOR=${FLAVOR:-staging}
WORKSPACE=${SCRIPT_DIR}/../workspace
APPDIR=${SCRIPT_DIR}/..
BUILD=${BUILD:-$(date +%s)}

( cd ${APPDIR} && flutter build ipa --build-number ${BUILD} --flavor staging -t lib/main_staging.dart --release --no-codesign --dart-define=FLAVOR=$FLAVOR )
mkdir -p ${WORKSPACE}/ios/staging
export VERSION_NAME=$(cat ${APPDIR}/pubspec.yaml | sed -nre 's/version: ([0-9]+\.[0-9]+\.[0-9]+)\+[0-9]+/\1/p')
( cd ${APPDIR}/ios && fastlane ios sign_staging )

cp -r ${APPDIR}/ios/Runner.ipa ${WORKSPACE}/ios/staging/Runner${VERSION_NAME}+${BUILD}.ipa
