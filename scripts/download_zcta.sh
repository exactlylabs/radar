#!/usr/bin/env bash

TARGET_DIR=input
URL="https://www2.census.gov/geo/tiger/TIGER2021/ZCTA520/tl_2021_us_zcta520.zip"

mkdir -p ${TARGET_DIR}

curl -s -f "${URL}" -o "${TARGET_DIR}/tl_2021_us_zcta520.zip"
