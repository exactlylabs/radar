#!/usr/bin/env bash
#
# Build and move to the workspace directory
#
#############################################
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
BASE_URL=${BASE_URL:-https://radar-staging.exactlylabs.com}
WORKSPACE=${SCRIPT_DIR}/../workspace
APPDIR=${SCRIPT_DIR}/..
BUILD=${BUILD:-$(date +%s)}

( cd ${APPDIR} && flutter build ipa --build-number ${BUILD} --flavor dev -t lib/main_dev.dart --release --no-codesign --dart-define=BASE_URL=$BASE_URL )
mkdir -p ${WORKSPACE}/ios/dev
export VERSION_NAME=$(cat ${APPDIR}/pubspec.yaml | sed -nre 's/version: ([0-9]+\.[0-9]+\.[0-9]+)\+[0-9]+/\1/p')
( cd ${APPDIR}/ios && fastlane ios sign_dev )

cp -r ${APPDIR}/ios/Runner.ipa ${WORKSPACE}/ios/dev/Runner${VERSION_NAME}+${BUILD}.ipa
