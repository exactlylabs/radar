#!/usr/bin/env bash
set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
YEAR=${YEAR:-2022}
if [ -z ${TARGET_DIR} ]; then
    TARGET_DIR=${SCRIPT_DIR}/../input
fi
mkdir -p ${TARGET_DIR}

# 5Digit Zip Codes
echo "Downloading ${YEAR} 5-Digit Zip Code Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER${YEAR}/ZCTA520/tl_${YEAR}_us_zcta520.zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/tl_${YEAR}_us_zcta520.zip"


# US States
echo "Download ${YEAR} US State Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER${YEAR}/STATE/tl_${YEAR}_us_state.zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/tl_${YEAR}_us_state.zip"


# US Counties
echo "Downloading ${YEAR} US Counties Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER${YEAR}/COUNTY/tl_${YEAR}_us_county.zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/tl_${YEAR}_us_county.zip"

# US Federally Recognized Tribal Lands
echo "Downloading ${YEAR} US Tribal Lands Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER${YEAR}/AIANNH/tl_${YEAR}_us_aiannh.zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/tl_${YEAR}_us_aiannh.zip"


# Census Tracts
echo "Downloading ${YEAR} US Census Tract Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER${YEAR}/TRACT/"
mkdir -p ${TARGET_DIR}/tracts
for state_fips in {1..78}
do
    if [ $state_fips -lt 10 ]; then
        state_fips="0${state_fips}"
    fi
    curl -sf "${URL}tl_${YEAR}_${state_fips}_tract.zip" -o "${TARGET_DIR}/tracts/tl_${YEAR}_${state_fips}_tract.zip" || true
done
