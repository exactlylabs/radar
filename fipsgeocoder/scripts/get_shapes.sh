#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
SHAPE_FILES_DIR=$SCRIPT_DIR/../shapes

COUNTIES_URL=ftp://ftp2.census.gov/geo/tiger/TIGER2021/COUNTY/tl_2021_us_county.zip
STATES_URL=ftp://ftp2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_state_5m.zip

mkdir -p $SHAPE_FILES
mkdir -p $SHAPE_FILES/counties
mkdir -p $SHAPE_FILES/states

curl -L --output $SHAPE_FILES/tl_2021_us_county.zip $COUNTIES_URL
curl -L --output $SHAPE_FILES/cb_2018_us_state_5m.zip $STATES_URL

unzip $SHAPE_FILES/tl_2021_us_county.zip -d $SHAPE_FILES/counties
unzip $SHAPE_FILES/cb_2018_us_state_5m.zip -d $SHAPE_FILES/states

rm $SHAPE_FILES/tl_2021_us_county.zip
rm $SHAPE_FILES/cb_2018_us_state_5m.zip

echo "Shapes copied"