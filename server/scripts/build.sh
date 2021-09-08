#!/usr/bin/env bash

IMAGE_NAME=radar_server
DEFAULT_TAG=local

set -e

if [[ $(git status --porcelain) ]]; then
  # Local changes, build local version only
  ADDITIONAL_TAGS=""
  echo "Local changes, building $DEFAULT_TAG image tag only"
else
  # No local changes, build SHA-labeled version
  ADDITIONAL_TAGS=$(git rev-parse HEAD)
  echo "Local is clean, building $DEFAULT_TAG and $ADDITIONAL_TAGS tag for production"
fi

docker buildx build --platform linux/amd64 -t $IMAGE_NAME:$DEFAULT_TAG .

for TAG in $ADDITIONAL_TAGS; do
  docker tag $IMAGE_NAME:$DEFAULT_TAG $IMAGE_NAME:$TAG
done

echo "Build Complete!"
