#!/bin/bash
set -e
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# download shape files
#$SCRIPT_DIR/get_shapes.sh

# Mount .gitconfig secret file
echo "
[url \"https://${1}@github.com/exactlylabs/\"]
  insteadof = https://github.com/exactlylabs/

""" > .gitconfig

DOCKER_BUILDKIT=1 docker build --secret id=gitconfig,src=.gitconfig -f deploy/Dockerfile -t fipsgeocoder:latest .

rm .gitconfig