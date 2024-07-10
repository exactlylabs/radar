#!/bin/bash
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# download shape files
#$SCRIPT_DIR/get_shapes.sh

if [ -z $GITHUB_TOKEN ]; then
    echo "ERROR: GITHUB_TOKEN is missing"
    exit 1
fi

# Mount .gitconfig secret file
echo "
[url \"https://${GITHUB_TOKEN}@github.com/exactlylabs/\"]
  insteadof = https://github.com/exactlylabs/

""" > .gitconfig

DOCKER_BUILDKIT=1 docker buildx build \
  --secret id=gitconfig,src=.gitconfig \
  -f docker/Dockerfile \
  --platform linux/amd64,linux/arm64 \
  -t fipsgeocoder:${VERSION} .

rm .gitconfig
