#!/usr/bin/env bash
#
# Build and move to the workspace directory
#
#############################################
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
FLAVOR=${FLAVOR:-prod}
WORKSPACE=${SCRIPT_DIR}/../workspace
APPDIR=${SCRIPT_DIR}/..
BUILD=${BUILD:-$(date +%s)}

( cd ${APPDIR} && flutter build ipa --build-number ${BUILD} --flavor prod -t lib/main_prod.dart --release --no-codesign --dart-define=FLAVOR=$FLAVOR )
mkdir -p ${WORKSPACE}/ios/prod
export VERSION_NAME=$(cat ${APPDIR}/pubspec.yaml | sed -nre 's/version: ([0-9]+\.[0-9]+\.[0-9]+)\+[0-9]+/\1/p')
( cd ${APPDIR}/ios && fastlane ios sign_prod )

cp -r ${APPDIR}/ios/Runner.ipa ${WORKSPACE}/ios/prod/Runner${VERSION_NAME}+${BUILD}.ipa
