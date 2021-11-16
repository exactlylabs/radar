#!/bin/bash

FILES=$(find ../../mlab-processor/output/geocode/*  -printf "%f\n")

clickhouse-client --query="alter table tests DELETE WHERE id is not null"

for file in $FILES
do
  cat ../../mlab-processor/output/geocode/$file | clickhouse-client --query="INSERT INTO tests FORMAT Parquet"
done

FILES=$(find ../../mlab-processor/output/reverse/*  -printf "%f\n")

clickhouse-client --query="alter table test_geos DELETE WHERE id is not null"

for file in $FILES
do
  cat ../../mlab-processor/output/reverse/$file | clickhouse-client --query="INSERT INTO test_geos FORMAT Parquet"
done
