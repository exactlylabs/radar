example of creating shape files:

# Create GeoJSON simplified GeoJSON file from US Tribal Tracts
ogr2ogr -f GeoJSON output.geojson tl_2021_us_ttract.shp -simplify 0.0001
