#!/usr/bin/env bash

# Builds RPM package for Radar Agent
# Expects package rpm to be installed

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if [ -z $(command -v rpmbuild) ]; then
  echo Error: RPM package is not installed
  exit 1
fi

# Copy rpmbuild package to home (this appears to be necessary)
# TODO: Search for how to use packaging dir instead

cp -r $SCRIPT_DIR/../packaging/rpmbuild ~

VERSION=$VERSION \
envsubst < $SCRIPT_DIR/../packaging/rpmbuild/SPECS/radar-agent.spec > ~/rpmbuild/SPECS/radar-agent.spec


# Call build for the specified package from the environment variables
make build BIN_NAME=radar-agent OUTPUT_DIR=~/rpmbuild/SOURCES/radar-agent-${VERSION}

cp ~/rpmbuild/SOURCES/radar-agent.service ~/rpmbuild/SOURCES/radar-agent-${VERSION}

# create a tarball
cd ~/rpmbuild/SOURCES/
tar -czvf radar-agent-${VERSION}.tar.gz radar-agent-${VERSION}

# Now build the RPM package
TARGET=${ARCH}
if [ $TARGET == "arm64" ]; then
  TARGET="aarch64"
elif [ $TARGET == "amd64" ]; then
  TARGET="x86_64"
fi

rpmbuild -ba --target=${TARGET} ~/rpmbuild/SPECS/radar-agent.spec