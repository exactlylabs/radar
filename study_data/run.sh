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

# Public schools
if [ ! -f sources/working/EDGE_GEOCODE_PUBLICSCH_2122.zip ]
then
  curl --output-dir sources/working -O https://nces.ed.gov/programs/edge/data/EDGE_GEOCODE_PUBLICSCH_2122.zip
fi
unzip -d sources/working sources/working/EDGE_GEOCODE_PUBLICSCH_2122.zip

if [ ! -f sources/working/EDGE_GEOCODE_PUBLICLEA_2122.zip]
then
  curl --output-dir sources/working -O https://nces.ed.gov/programs/edge/data/EDGE_GEOCODE_PUBLICLEA_2122.zip
fi
unzip -d sources/working sources/working/EDGE_GEOCODE_PUBLICLEA_2122.zip

if [ -f sources/working/EDGE_GEOCODE_PUBLICSCH_2122/EDGE_GEOCODE_PUBLICSCH_2122.csv ]
then
  rapidcsv public_schools ./sources/working/EDGE_GEOCODE_PUBLICSCH_2122/EDGE_GEOCODE_PUBLICSCH_2122.csv
fi

if [ -f sources/working/EDGE_GEOCODE_PUBLICLEA_2122/EDGE_GEOCODE_PUBLICLEA_2122.csv ]
then
  rapidcsv school_districts ./sources/working/EDGE_GEOCODE_PUBLICLEA_2122/EDGE_GEOCODE_PUBLICLEA_2122.csv
fi

for file in ./sql/*; do
  psql workspace -f "${file}"
done

# OUTPUT Study clinics
psql workspace -c "\COPY (SELECT * FROM phycomp_study_locations) TO STDOUT CSV HEADER" > output/medical.csv

# OUTPUT public schools
psql workspace -c "\COPY (SELECT * FROM study_schools) TO STDOUT CSV HEADER" > output/schools.csv

# Get County Shapes for study area
#                                    https://www2.census.gov/geo/tiger/TIGER2022/COUNTY/tl_2022_us_county.zip
if [ ! -f sources/working/cb_2018_us_county_5m.zip ]
then
  curl --output-dir sources/working -O https://www2.census.gov/geo/tiger/GENZ2018/shp/cb_2018_us_county_5m.zip
fi
unzip -d sources/working sources/working/cb_2018_us_county_5m.zip

# Get places
# Texas
if [ ! -f sources/working/tl_2022_48_place.zip ]
then
  curl --output-dir sources/working -O https://www2.census.gov/geo/tiger/TIGER2022/PLACE/tl_2022_48_place.zip
fi
unzip -d sources/working sources/working/tl_2022_48_place.zip
# Alaska
if [ ! -f sources/working/tl_2022_02_place.zip ]
then
  curl --output-dir sources/working -O https://www2.census.gov/geo/tiger/TIGER2022/PLACE/tl_2022_02_place.zip
fi
unzip -d sources/working sources/working/tl_2022_02_place.zip
# West Virgina
if [ ! -f sources/working/tl_2022_54_place.zip ]
then
  curl --output-dir sources/working -O https://www2.census.gov/geo/tiger/TIGER2022/PLACE/tl_2022_54_place.zip
fi
unzip -d sources/working sources/working/tl_2022_54_place.zip
# Michigan
if [ ! -f sources/working/tl_2022_26_place.zip ]
then
  curl --output-dir sources/working -O https://www2.census.gov/geo/tiger/TIGER2022/PLACE/tl_2022_26_place.zip
fi
unzip -d sources/working sources/working/tl_2022_26_place.zip

COUNTY_FIPS=$(psql workspace -t -c "SELECT CONCAT('''', STRING_AGG(fips, ''', '''), '''') FROM study_counties")
ogr2ogr -WHERE "GEOID IN ($COUNTY_FIPS)" -f KML output/study-counties.kml ./sources/working/cb_2018_us_county_5m.shp

# Texas
ogr2ogr -WHERE "SUBSTR(GEOID, 1, 5) IN ($COUNTY_FIPS)" -f KML output/study-places-tx.kml ./sources/working/tl_2022_48_place.shp
ogr2ogr -WHERE "PLACEFP IN ($COUNTY_FIPS)" -f KML output/study-places-tx.kml ./sources/working/tl_2022_48_place.shp

# Alaska
ogr2ogr -WHERE "SUBSTR(GEOID, 1, 5) IN ($COUNTY_FIPS)" -f KML output/study-places-ak.kml ./sources/working/tl_2022_02_place.shp

# Michigan
ogr2ogr -WHERE "SUBSTR(GEOID, 1, 5) IN ($COUNTY_FIPS)" -f KML output/study-places-mi.kml ./sources/working/tl_2022_26_place.shp

# West Virigina
ogr2ogr -WHERE "SUBSTR(GEOID, 1, 5) IN ($COUNTY_FIPS)" -f KML output/study-places-wv.kml ./sources/working/tl_2022_54_place.shp
# Notes to get places in counties
# https://gis.stackexchange.com/questions/119374/intersect-shapefiles-using-shapely
# https://gis.stackexchange.com/questions/223183/ogr2ogr-merge-multiple-shapefiles-what-is-the-purpose-of-nln-tag