#!/usr/bin/env sh

set -e

if [ "$TARGETPLATFORM" = "linux/amd64" ]; then
  curl -o /app/radar-agent https://pods.radartoolkit.com/client_versions/stable/distributions/linux-amd64/download
  exit 0
elif [ "$TARGETPLATFORM" = "linux/arm64" ]; then
  curl -o /app/radar-agent https://pods.radartoolkit.com/client_versions/stable/distributions/linux-arm64/download
  exit 0
else
  echo "Unsupported platform: $TARGETPLATFORM"
  exit 1
fi

