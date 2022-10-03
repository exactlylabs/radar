#!/usr/bin/env bash
set -e
TOLERANCE=${TOLERANCE:-0.0012}
TARGET_DIR=geos
mkdir -p ${TARGET_DIR}

# US States
echo "Download US State Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER2021/STATE/tl_2021_us_state.zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/tl_2021_us_state.zip"
unzip -o "${TARGET_DIR}/tl_2021_us_state.zip" -d "${TARGET_DIR}/tl_2021_us_state"
ogr2ogr -simplify $TOLERANCE -f GeoJSON "${TARGET_DIR}/US_STATES.geojson" "${TARGET_DIR}/tl_2021_us_state/tl_2021_us_state.shp"


# US Counties
echo "Downloading US Counties Shapes"
URL="https://www2.census.gov/geo/tiger/TIGER2021/COUNTY/tl_2021_us_county.zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/tl_2021_us_county.zip"
unzip -o "${TARGET_DIR}/tl_2021_us_county.zip" -d "${TARGET_DIR}/tl_2021_us_county"
ogr2ogr -simplify $TOLERANCE  -f GeoJSON "${TARGET_DIR}/US_COUNTIES.geojson" "${TARGET_DIR}/tl_2021_us_county/tl_2021_us_county.shp"

# US Tribal Tracts
echo "Downloading US Tribal Tract Shapes"
URL="https://www.sciencebase.gov/catalog/file/get/4f4e4a2ee4b07f02db61576c?facet=Indian_Reservations"
curl -s -f "${URL}" -o "${TARGET_DIR}/Indian_Reservations.zip"
unzip -o "${TARGET_DIR}/Indian_Reservations.zip" -d "${TARGET_DIR}/Indian_Reservations"
ogr2ogr -simplify $TOLERANCE -f GeoJSON "${TARGET_DIR}/Indian_Reservations.geojson" "${TARGET_DIR}/Indian_Reservations/Indian_Reservations.shp"