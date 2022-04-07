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



## Troubleshooting

Bellow are the common problems you might run into and how to possibly solve them.


#### **MEMORY_LIMIT_EXCEEDED**

If you run through an error like the following:

```
Code: 241. DB::Exception: Received from localhost:9000. DB::Exception: Memory limit (for query) exceeded: would use 9.32 GiB (attempt to allocate chunk of 4962739 bytes), maximum: 9.31 GiB: While executing JoiningTransform. (MEMORY_LIMIT_EXCEEDED)
```

Make sure you have configured the following settings:

> Note that these commands are session-wise

```sql
set max_memory_usage=16000000000;
set max_bytes_before_external_group_by = 5000000000;
set join_algorithm = 'partial_merge';
```

