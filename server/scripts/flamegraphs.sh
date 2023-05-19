#!/usr/bin/env bash

# Generates FlamesGraphs from dumps that match tmp/stackprof-cpu-*.dump

for f in `ls tmp/stackprof-cpu-*.dump`; do 
  stackprof --d3-flamegraph $f > $f.flamegraph.html;
  echo "Generated $f.flamegraph.html"
done
