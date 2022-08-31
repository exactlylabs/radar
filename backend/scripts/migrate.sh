#!/usr/bin/env bash

set -e

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
  psql -d "host=${DB_HOST:-127.0.0.1} dbname=${DB_NAME:-mlab-mapping} user=${DB_USER:-postgres} password=${DB_PASSWORD:-postgres} port=${DB_PORT:-54321} sslmode=disable" -f "${DIR}/${FILE}"
  echo "done"
done
