#!/usr/bin/env bash
#
# Build and move to the workspace directory
#
#############################################
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
BASE_URL=${BASE_URL:-https://pods.radartoolkit.com}
WORKSPACE=${SCRIPT_DIR}/../workspace
APPDIR=${SCRIPT_DIR}/..
BUILD=${BUILD:-$(date +%s)}
( cd ${APPDIR} && flutter build apk --build-number ${BUILD} --release --flavor prod -t lib/main_prod.dart --dart-define=BASE_URL=$BASE_URL )

export VERSION_NAME=$(cat ${APPDIR}/pubspec.yaml | sed -nre 's/version: ([0-9]+\.[0-9]+\.[0-9]+)\+[0-9]+/\1/p')
mkdir -p ${WORKSPACE}/android/prod/${VERSION_NAME}+${BUILD}/

cp ${SCRIPT_DIR}/../build/app/outputs/flutter-apk/app-prod-release.apk ${WORKSPACE}/android/prod/${VERSION_NAME}+${BUILD}/app_${VERSION_NAME}+${BUILD}-release.apk
