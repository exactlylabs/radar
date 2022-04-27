#!/usr/bin/env bash

set -e

ln -s /cloudsql/$GCP_DB_INSTANCE/.s.PGSQL.5432 pg.sock

# Forward TCP:5432 to Cloud SQL Unix socket
nohup socat -d -d TCP4-LISTEN:5432,fork UNIX-CONNECT:pg.sock &

# Run Metabase
/app/run_metabase.sh

