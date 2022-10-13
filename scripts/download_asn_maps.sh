#!/usr/bin/env bash

set -e

if [ -z $MAXMIND_KEY ]; then
    echo "ERROR: MAXMIND_KEY variable is not set"
    exit 1
fi

TARGET_DIR=input
mkdir -p ${TARGET_DIR}

# ASN code to Organization Map
URL="https://publicdata.caida.org/datasets/as-organizations/20221001.as-org2info.jsonl.gz"
curl -s -f "${URL}" -o "${TARGET_DIR}/20220401.as-org2info.jsonl.gz"
gzip -fd ${TARGET_DIR}/20220401.as-org2info.jsonl.gz

# IPVx to ASN Map
rm -rf input/GeoLite2-City-CSV_*
URL="https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City-CSV&license_key=${MAXMIND_KEY}&suffix=zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/GeoLite2-City-CSV.zip"
unzip -o -d input input/GeoLite2-City-CSV.zip
cp input/GeoLite2-City-CSV_*/*IPv4.csv input/
cp input/GeoLite2-City-CSV_*/*IPv6.csv input/

# IPVx to ASN Map
rm -rf input/GeoLite2-ASN-CSV_*
URL="https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN-CSV&license_key=${MAXMIND_KEY}&suffix=zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/GeoLite2-ASN-CSV.zip"
unzip -o -d input input/GeoLite2-ASN-CSV.zip
cp input/GeoLite2-ASN-CSV_*/*IPv4.csv input/
cp input/GeoLite2-ASN-CSV_*/*IPv6.csv input/