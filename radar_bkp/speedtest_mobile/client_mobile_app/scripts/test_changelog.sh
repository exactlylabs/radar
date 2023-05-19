#!/usr/bin/env bash

# Assert Android's metadata has the changelog for the current version control
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

VC=$(cat pubspec.yaml | sed -ne 's/version: [0-9]\.[0-9]\.[0-9]+//p')

if [ ! -f  "${SCRIPT_DIR}/../android/fastlane/metadata/en-US/changelogs/${VC}.txt" ]; then
    echo "Changelog ${SCRIPT_DIR}/../android/fastlane/metadata/en-US/changelogs/${VC}.txt not found"
exit 1
fi