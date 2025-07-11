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
( cd ${APPDIR} && flutter build appbundle --build-number ${BUILD} --release --flavor prod -t lib/main_prod.dart --dart-define=FLAVOR=$FLAVOR )

export VERSION_NAME=$(cat ${APPDIR}/pubspec.yaml | sed -nre 's/version: ([0-9]+\.[0-9]+\.[0-9]+)\+[0-9]+/\1/p')
mkdir -p ${WORKSPACE}/android/prod/${VERSION_NAME}+${BUILD}/

cp ${SCRIPT_DIR}/../build/app/outputs/bundle/prodRelease/app-prod-release.aab ${WORKSPACE}/android/prod/${VERSION_NAME}+${BUILD}/app_${VERSION_NAME}+${BUILD}-release.aab
