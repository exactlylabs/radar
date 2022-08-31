#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

cd $SCRIPT_DIR

docker-compose up -d

until docker-compose exec timescaledb pg_isready -d nuka_dev 2>/dev/null; do
  echo "waiting for postgresql to be ready"
  sleep 1
  
done

./migrate.sh


cd $SCRIPT_DIR/..

go run cmd/start_ingestor/main.go
