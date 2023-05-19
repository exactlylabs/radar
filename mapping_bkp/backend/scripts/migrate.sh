#!/usr/bin/env bash

set -e

echo "Starting Migrations"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

USER=${DB_USER:-default}
PASSWORD=${DB_PASSWORD}
HOST=${DB_HOST:-localhost}
PORT=${DB_PORT:-9000}
NAME=${DB_NAME:-default}

if [ -z $1 ]; then
DIR=${SCRIPT_DIR}/../migrations
else
DIR=$1
fi

FILES=$(ls -1 ${DIR})
echo "Connecting to clickhouse://${USER}:${PASSWORD}@${HOST}:${PORT}/${NAME}"
for FILE in ${FILES}
do
  if [ ! -f ${DIR}/migrated_files ] || ! grep -Fxq ${FILE} ${DIR}/migrated_files && [ ${FILE} != "migrated_files" ]
  then
    echo ${DIR}/${FILE}
    if [ -z ${PASSWORD} ];then
      cat ${DIR}/${FILE} | clickhouse-client \
            --host=${HOST} \
            --port=${PORT} \
            --user=${USER} \
            --database=${NAME}
    else
      cat ${DIR}/${FILE} | clickhouse-client \
            --password=${PASSWORD} \
            --host=${HOST} \
            --port=${PORT} \
            --user=${USER} \
            --database=${NAME}
    fi
    echo "done"
    echo ${FILE} >> ${DIR}/migrated_files
  fi
done
echo "Finished Migrations"
