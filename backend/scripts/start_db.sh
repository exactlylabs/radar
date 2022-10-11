#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cd $SCRIPT_DIR

docker-compose up -d


DB_PORT=9001 ./migrate.sh
cd $SCRIPT_DIR/..