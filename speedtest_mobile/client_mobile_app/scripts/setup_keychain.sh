#!/usr/bin/env bash

MY_KEYCHAIN="RadarIOSKeyChain.keychain"
security create-keychain -p "" "$MY_KEYCHAIN"
security list-keychains -d user -s "$MY_KEYCHAIN" $(security list-keychains -d user | sed s/\"//g)
security set-keychain-settings "$MY_KEYCHAIN"
security unlock-keychain -p "" "$MY_KEYCHAIN"

security import $P12_KEY_PATH -k "$MY_KEYCHAIN" -P "" -T "/usr/bin/codesign" -T "/usr/bin/productbuild" -T "/usr/bin/xcodebuild"
security import $CERT_PATH -k "$MY_KEYCHAIN" -P "" -T "/usr/bin/codesign" -T "/usr/bin/productbuild" -T "/usr/bin/xcodebuild"

security set-key-partition-list -S apple-tool:,apple: -s -k "" $MY_KEYCHAIN