#!/usr/bin/env bash
#
# Build and move to the workspace directory
#
#############################################
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

WORKSPACE=${SCRIPT_DIR}/../workspace
APPDIR=${SCRIPT_DIR}/..
flutter build appbundle --release --flavor dev -t lib/main_dev.dart

mkdir -p ${WORKSPACE}/android/dev

export VERSION=$(cat ${APPDIR}/android/local.properties | sed -n -e 's/^flutter\.versionName=//p')
cp ${SCRIPT_DIR}/../build/app/outputs/bundle/devRelease/app-dev-release.aab ${WORKSPACE}/android/dev/app_${VERSION}-release.aab
