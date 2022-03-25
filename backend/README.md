example of creating shape files:

# Create GeoJSON simplified GeoJSON file from US Tribal Tracts
ogr2ogr -f GeoJSON output.geojson tl_2021_us_ttract.shp -simplify 0.0001


### Setup

1. Install [clickhouse](https://clickhouse.com/#quick-start) database

2. Create a new Database or use the default one:
    * `clickhouse-client --query "CREATE DATABASE mlab"`

3. Run all migrations:
    * backend/scripts/run_migrations.sh --database mlab

4. Then run backend/run bulk_load.sh

