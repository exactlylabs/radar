#!/usr/bin/env bash
#
# Build and move to the workspace directory
#
#############################################
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
FLAVOR=${FLAVOR:-dev}
WORKSPACE=${SCRIPT_DIR}/../workspace
APPDIR=${SCRIPT_DIR}/..
BUILD=${BUILD:-$(date +%s)}
( cd ${APPDIR} && flutter build appbundle --build-number ${BUILD} --release --flavor dev -t lib/main_dev.dart --dart-define=FLAVOR=$FLAVOR )

export VERSION_NAME=$(cat ${APPDIR}/pubspec.yaml | sed -nre 's/version: ([0-9]+\.[0-9]+\.[0-9]+)\+[0-9]+/\1/p')
mkdir -p ${WORKSPACE}/android/dev/${VERSION_NAME}+${BUILD}/

cp ${SCRIPT_DIR}/../build/app/outputs/bundle/devRelease/app-dev-release.aab ${WORKSPACE}/android/dev/${VERSION_NAME}+${BUILD}/app_${VERSION_NAME}+${BUILD}-release.aab
