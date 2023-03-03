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
( cd ${APPDIR} && flutter build appbundle --build-number ${BUILD} --release --flavor dev -t lib/main_dev.dart )

mkdir -p ${WORKSPACE}/android/dev

export VERSION_NAME=$(cat ${APPDIR}/pubspec.yaml | sed -nre 's/version: ([0-9]+\.[0-9]+\.[0-9]+)\+[0-9]+/\1/p')
cp ${SCRIPT_DIR}/../build/app/outputs/bundle/devRelease/app-dev-release.aab ${WORKSPACE}/android/dev/app_${VERSION_NAME}+${BUILD}-release.aab
