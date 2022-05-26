#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ulimit -n 10000 || true

cd $SCRIPT_DIR/..

if ! command -v reflex &> /dev/null 2>&1
then
    echo "Installing `reflex` to watch for changes and recompile on demand"
  cd ~
  go get github.com/cespare/reflex
fi

echo watching $(pwd)

reflex --decoration=none -c reflex.config
