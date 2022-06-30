#!/usr/bin/env bash

set -e

TARGET_DIR=input
mkdir -p ${TARGET_DIR}

# ASN code to Organization Map
URL="https://publicdata.caida.org/datasets/as-organizations/20220401.as-org2info.jsonl.gz"
curl -s -f "${URL}" -o "${TARGET_DIR}/20220401.as-org2info.jsonl.gz"
gzip -d ${TARGET_DIR}/20220401.as-org2info.jsonl.gz

# IPVx to ASN Map
URL="https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City-CSV&license_key=${MAXMIND_KEY}&suffix=zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/GeoLite2-City-CSV.zip"
unzip input/GeoLite2-City-CSV.zip
cp GeoLite2-City-CSV_*/*IPv4.csv input/
cp GeoLite2-City-CSV_*/*IPv6.csv input/