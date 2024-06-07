#!/usr/bin/env bash

##
#
# Copy tables content from the production database with exception of report-related tables and measurements.
# This script will clear your local db before copying the data.
#
##

PG_DUMP_BIN=/usr/lib/postgresql/13/bin/pg_dump
TARGET_DB_NAME=${TARGET_DB_NAME:-"radar_development"}

if [ -z "$1" ]; then
  echo "Usage: $0 <production_database_uri>"
  exit 1
fi

rails db:drop db:create db:migrate

$PG_DUMP_BIN $1 \
  -a \
  -t users \
  -t accounts \
  -t users_accounts \
  -t shared_accounts \
  -t client_versions \
  -t watchdog_versions \
  -t update_groups \
  -t clients \
  -t locations \
  -t autonomous_systems \
  -t autonomous_system_orgs \
  -t events \
  -t snapshots \
  -t geospaces \
  -t geospaces_locations \
  -t study_aggregates \
  -t autonomous_system_orgs_geospaces \
  -t system_outages \
  -t categories \
  -t categories_locations \
  -t feature_flags
  -t feature_flags_users | psql -d $TARGET_DB_NAME
