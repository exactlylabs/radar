#!/usr/bin/env bash
#
# Build and move to the workspace directory
#
#############################################
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

WORKSPACE=${SCRIPT_DIR}/../workspace
APPDIR=${SCRIPT_DIR}/..
( cd ${APPDIR} && flutter build appbundle --release --flavor prod -t lib/main_dev.dart )

mkdir -p ${WORKSPACE}/android/prod

export VERSION=$(cat ${APPDIR}/android/local.properties | sed -n -e 's/^flutter\.versionName=//p')
export VERSION_CODE=$(cat ${APPDIR}/android/local.properties | sed -n -e 's/^flutter\.versionCode=//p')
cp ${SCRIPT_DIR}/../build/app/outputs/bundle/prodRelease/app-prod-release.aab ${WORKSPACE}/android/prod/app_${VERSION}+${VERSION_CODE}-release.aab
