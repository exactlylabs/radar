#!/usr/bin/env bash

set -e 

# Notarization Process of the .pkg file

## **Make sure to create an AppleId password, your account's password won't be accepted!
##   proceed to: https://appleid.apple.com/account/manage


# If the error: "xcrun: error: unable to find utility "altool", not a developer tool or in PATH"
# happens, just run the commented code bellow

# sudo xcode-select -r


xcrun altool \
    -type osx \
    --notarize-app \
    --primary-bundle-id "${APPLE_BUNDLE_ID}" \
    --username "${APPLEID_USERNAME}" \
    --password "${APPLEID_PWD}" \
    --file "${PKG_PATH}"
