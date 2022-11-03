#!/usr/bin/env bash
#
# Build and move to the workspace directory
#
#############################################
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

WORKSPACE=${SCRIPT_DIR}/../workspace
APPDIR=${SCRIPT_DIR}/..
( cd ${APPDIR} && flutter build appbundle --release --flavor staging -t lib/main_staging.dart )

mkdir -p ${WORKSPACE}/android/staging

export VERSION=$(cat ${APPDIR}/android/local.properties | sed -n -e 's/^flutter\.versionName=//p')
export VERSION_CODE=$(cat ${APPDIR}/android/local.properties | sed -n -e 's/^flutter\.versionCode=//p')
cp ${SCRIPT_DIR}/../build/app/outputs/bundle/stagingRelease/app-staging-release.aab ${WORKSPACE}/android/staging/app_${VERSION}+${VERSION_CODE}-release.aab
