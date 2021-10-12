#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cd $SCRIPT_DIR/..

yarn install

yarn run build

gsutil -h "Cache-Control:no-cache, max-age=0" rsync -R dist gs://radar.exactlylabs.com
