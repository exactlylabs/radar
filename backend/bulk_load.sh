#!/bin/bash

FILES=$(find /media/ndt7/output/geoids/*  -printf "%f\n")

clickhouse-client --query="alter table tests DELETE WHERE id is not null"

for file in $FILES
do
  cat /media/ndt7/output/geoids/$file | clickhouse-client --query="INSERT INTO tests FORMAT CSVWithNames"
done
