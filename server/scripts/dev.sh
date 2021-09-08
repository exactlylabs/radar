#!/usr/bin/env bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

if test -f "$SCRIPT_DIR/../dev.config"; then
  . $SCRIPT_DIR/../dev.config
fi

echo "Hello future developer, I'm ./scripts/dev.sh"
echo "I'm here to run and restart github.com/exactlylabs/radar/server on file changes"

if ! command -v reflex &> /dev/null 2>&1
then
  echo "Installing `reflex` to watch for changes and recompile on demand"
  cd ~
  go get github.com/cespare/reflex
fi

cd $SCRIPT_DIR/..

reflex --decoration=none -c reflex.config
