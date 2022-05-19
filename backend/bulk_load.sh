#!/bin/bash

set -e

function usage() {
echo """
Usage: bulk_load.sh [options] files_path

Required Arguments:

  files_path: path to the output directory containing the expected avro files

Optional Arguments:

  -d or --database <db_name> : Database name to connect to. [default: default]
"""
}

while :; do
    case $1 in
        -h|--help)
            usage
            exit 0
        ;;
        -d|--database) 
            if [ "$2" ]; then
                database=$2
                shift
            else
                echo 'ERROR: --database requires a non-empty option argument'
                exit 1
            fi
        ;;
        *) break
    esac
    shift
done

if [ -z "$1" ]; then
  echo "ERROR: this script expects one required argument: files_path"
  usage
  exit 1
else
  filespath=$1
fi

database=${database:-default}

FILES=$(find $filespath/geocode/*.avro  -printf "%f\n")
echo "Starting Bulk Load for database ${database}"

clickhouse-client  --database $database --query="TRUNCATE TABLE tests"

for i in {1..10}
do
  for file in $FILES
  do
    echo -ne "Inserting geocode/$file... "
    cat $filespath/geocode/$file | clickhouse-client --max_memory_usage=16000000000 --database $database --query="INSERT INTO tests FORMAT Avro"
    echo -ne "\033[0;32mOK\033[0m"
    echo
  done

  FILES=$(find $filespath/reverse/*.avro  -printf "%f\n")

  clickhouse-client --database $database --query="TRUNCATE TABLE test_geos"

  for file in $FILES
  do
    echo -ne "Inserting reverse/$file... "
    cat $filespath/reverse/$file | clickhouse-client --max_memory_usage=16000000000 --database $database --query="INSERT INTO test_geos FORMAT Avro"
    echo -ne "\033[0;32mOK\033[0m"
    echo
  done
done
echo "All Done!"
