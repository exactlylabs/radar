#!/usr/bin/env bash

set -e

if [ -z $DB_PASSWORD ]; then
  echo "Error: You should set a DB_PASSWORD environment variable"
  exit 1
fi

echo "migrating db"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if [ -z $1 ]; then
DIR=${SCRIPT_DIR}/../migrations
else
DIR=$1
fi

FILES=$(ls -1 ${DIR})

for FILE in ${FILES}
do
  echo ${DIR}/${FILE}
  cat ${DIR}/${FILE} | clickhouse-client \
        --password=${DB_PASSWORD} \
        --host=${DB_HOST:-localhost} \
        --port=${DB_PORT:-9000} \
        --user=${DB_USER:-default} \
        --database=${DB_NAME:-default}
  echo "done"
done
