#!/usr/bin/env bash
set -e

echo $GOOGLE_STORAGE_CREDENTIALS | base64 -d > /app/gcs.keyfile
./scripts/setup.sh
