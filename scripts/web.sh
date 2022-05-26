#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# We need to source rvm again, because it's not automatically configuring the correct ruby for the project
source ~/.rvm/scripts/rvm

cd $SCRIPT_DIR/../server

rails s
