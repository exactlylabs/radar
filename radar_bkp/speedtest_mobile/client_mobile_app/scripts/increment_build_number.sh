#!/usr/bin/env bash

# Increments by one the Version Code

set -e 

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
APPDIR=${SCRIPT_DIR}/..

VC=$(cat ${APPDIR}/pubspec.yaml | sed -ne 's/version: [0-9]\+\.[0-9]\+\.[0-9]\++\+//p')
echo "Current VC is ${VC}"
NVC=$(echo "$((VC + 1))")

echo "Setting new version code to ${NVC}"
sed -ie "s/version: \([0-9]\+\.[0-9]\+\.[0-9]\+\)+[0-9]\+/version: \1+${NVC}/g" ${APPDIR}/pubspec.yaml
echo "Validating change"
VC=$(cat ${APPDIR}/pubspec.yaml | sed -ne 's/version: [0-9]\+\.[0-9]\+\.[0-9]\++\+//p')

if [ ${VC} -ne ${NVC} ]; then
    echo "Error: failed to update version code, new version code is not the expected value"
    exit 1
fi
echo "Change validated!"
echo "Version code updated successfully"