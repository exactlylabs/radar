#!/usr/bin/env bash

set -e

CONTEXTS=$(docker context ls --format="{{ .Name }}")
STAGING_CREATED=$(echo "$CONTEXTS" | grep '^radar-staging$')

if [ ! "$STAGING_CREATED" == "radar-staging"  ]; then
  docker context create \
    --docker host=ssh://admin@manager-01.staging.radartoolkit.com \
    --description "Docker Swarm Manager context for Radar project - Staging" \
    radar-staging
fi

PROD_CREATED=$(docker context ls --format="{{ .Name }}" | grep radar-production)
if [ ! "$PROD_CREATED" == "radar-production" ]; then
  docker context create \
    --docker host=ssh://admin@manager-01.radartoolkit.com \
    --description "Docker Swarm Manager context for Radar project - Production" \
    radar-production
fi
