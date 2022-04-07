#!/bin/bash
set -e
echo $1
while :; do
    case $1 in
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

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo -e Applying Migrations to Database ${database:-default}\\n

FILES=$(find $SCRIPT_DIR/../migrations/*.sql -printf "%f\n")

for file in $FILES
do
    echo -ne "$\033[0mApplying $file...\r"
    cat $SCRIPT_DIR/../migrations/$file | clickhouse-client \
        --max_memory_usage=16000000000 \
        --join_algorithm='partial_merge' \
        --max_bytes_before_external_group_by=5000000000 \
        --database=${database:-default}
        
    echo -ne "Applying $file... \033[0;32mOK\r"
    echo
done
