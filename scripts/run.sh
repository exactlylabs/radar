#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"


(trap 'kill 0' SIGINT; $SCRIPT_DIR/web.sh & cd $SCRIPT_DIR/../agent && make run)
