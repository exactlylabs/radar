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
( cd ${APPDIR} && flutter build appbundle --build-number ${BUILD} --release --flavor staging -t lib/main_staging.dart --dart-define=FLAVOR=$FLAVOR )

export VERSION_NAME=$(cat ${APPDIR}/pubspec.yaml | sed -nre 's/version: ([0-9]+\.[0-9]+\.[0-9]+)\+[0-9]+/\1/p')
mkdir -p ${WORKSPACE}/android/staging/${VERSION_NAME}+${BUILD}/

cp ${SCRIPT_DIR}/../build/app/outputs/bundle/stagingRelease/app-staging-release.aab ${WORKSPACE}/android/staging/${VERSION_NAME}+${BUILD}/app_${VERSION_NAME}+${BUILD}-release.aab
