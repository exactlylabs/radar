#!/usr/bin/env bash

set -e

mkdir -p sources/working
mkdir -p output

if [ ! -f sources/working/hud-q4-2021-zip-county-crosswalk.csv ]
then
  gunzip -c sources/hud-q4-2021-zip-county-crosswalk.csv.gz > sources/working/hud-q4-2021-zip-county-crosswalk.csv
fi
if [ ! -f sources/working/DAC_NationalDownloadableFile.csv ]
then
  curl --output-dir sources/working -O https://data.cms.gov/provider-data/sites/default/files/resources/69a75aa9d3dc1aed6b881725cf0ddc12_1674273921/DAC_NationalDownloadableFile.csv
fi

iconv -c -f WINDOWS-1252 -t UTF8 sources/working/DAC_NationalDownloadableFile.csv > ./sources/working/DAC_NationalDownloadableFile_fixed.csv

rapidcsv zip_county_crosswalk sources/working/hud-q4-2021-zip-county-crosswalk.csv
rapidcsv study_counties sources/public_study_counties_export_2023-02-20_131401.csv
rapidcsv phycomp sources/working/DAC_NationalDownloadableFile_fixed.csv

for file in ./sql/*; do
  psql workspace -f "${file}"
done

# OUTPUT Study clinics
psql workspace -c "\COPY (SELECT * FROM phycomp_study_locations) TO STDOUT CSV HEADER" > output/medical.csv

# Get County Shapes for study area
curl --output-dir sources/working -O https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_county_5m.zip
unzip sources/working/cb_2018_us_county_5m.zip -d sources/working

COUNTY_FIPS=$(psql workspace -t -c "SELECT CONCAT('''', STRING_AGG(fips, ''', '''), '''') FROM study_counties")
ogr2ogr -WHERE "GEOID IN ($COUNTY_FIPS)" -f KML output/study-counties.kml ./sources/working/cb_2018_us_county_5m.shp
