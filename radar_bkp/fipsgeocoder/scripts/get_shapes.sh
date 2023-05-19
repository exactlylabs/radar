#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
SHAPE_FILES_DIR=$SCRIPT_DIR/../shapes

COUNTIES_URL=ftp://ftp2.census.gov/geo/tiger/TIGER2021/COUNTY/tl_2021_us_county.zip
STATES_URL=ftp://ftp2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_state_5m.zip

mkdir -p $SHAPE_FILES_DIR
mkdir -p $SHAPE_FILES_DIR/counties
mkdir -p $SHAPE_FILES_DIR/states

curl -L --output $SHAPE_FILES_DIR/tl_2021_us_county.zip $COUNTIES_URL
curl -L --output $SHAPE_FILES_DIR/cb_2018_us_state_5m.zip $STATES_URL

unzip $SHAPE_FILES_DIR/tl_2021_us_county.zip -d $SHAPE_FILES_DIR/counties
unzip $SHAPE_FILES_DIR/cb_2018_us_state_5m.zip -d $SHAPE_FILES_DIR/states

rm $SHAPE_FILES_DIR/tl_2021_us_county.zip
rm $SHAPE_FILES_DIR/cb_2018_us_state_5m.zip

echo "Shapes copied"