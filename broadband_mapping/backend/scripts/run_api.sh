#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

$SCRIPT_DIR/start_db.sh

if ! command -v reflex &> /dev/null 2>&1
then
    echo "Installing `reflex` to watch for changes and recompile on demand"
  go install github.com/cespare/reflex@latest
fi

if ! command -v reflex &> /dev/null 2>&1
then
    echo "reflex command not found. Is your \$GOBIN environment added to path?"
fi

echo watching $(pwd)

reflex --decoration=none -c reflex.api.config
