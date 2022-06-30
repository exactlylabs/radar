#!/usr/bin/env bash

TARGET_DIR=input/tracts
URL="https://www2.census.gov/geo/tiger/TIGER2021/TRACT/"

mkdir -p ${TARGET_DIR}

for state_fips in {1..78}
do
    if [ $state_fips -lt 10 ]; then
        state_fips="0${state_fips}"
    fi
    curl -s -f "${URL}tl_2021_${state_fips}_tract.zip" -o "${TARGET_DIR}/tl_2021_${state_fips}_tract.zip"
done
