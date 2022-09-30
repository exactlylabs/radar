#!/usr/bin/env bash
set -e
TARGET_DIR=input
mkdir -p ${TARGET_DIR}

# 5Digit Zip Codes
echo "Downloading 5-Digit Zip Code Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER2021/ZCTA520/tl_2021_us_zcta520.zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/tl_2021_us_zcta520.zip"


# US States
echo "Download US State Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER2021/STATE/tl_2021_us_state.zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/tl_2021_us_state.zip"


# US Counties
echo "Downloading US Counties Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER2021/COUNTY/tl_2021_us_county.zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/tl_2021_us_county.zip"

# US Tribal Tracts
echo "Downloading US Tribal Tract Shapes"
URL="https://www.sciencebase.gov/catalog/file/get/4f4e4a2ee4b07f02db61576c?facet=Indian_Reservations"
curl -s -f "${URL}" -o "${TARGET_DIR}/Indian_Reservations.zip"


# Census Tracts
echo "Downloading US Census Tract Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER2021/TRACT/"
mkdir -p ${TARGET_DIR}/tracts
for state_fips in {1..78}
do
    if [ $state_fips -lt 10 ]; then
        state_fips="0${state_fips}"
    fi
    curl -sf "${URL}tl_2021_${state_fips}_tract.zip" -o "${TARGET_DIR}/tracts/tl_2021_${state_fips}_tract.zip" || true
done
