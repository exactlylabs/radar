#!/usr/bin/env bash

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

if [ -z $MAXMIND_KEY ]; then
    echo "ERROR: MAXMIND_KEY variable is not set"
    exit 1
fi

if [ -z ${TARGET_DIR} ]; then
    TARGET_DIR=${SCRIPT_DIR}/../lib/geotools/files
fi
mkdir -p ${TARGET_DIR}

# ASN code to Organization Map
URL="https://publicdata.caida.org/datasets/as-organizations/20221001.as-org2info.jsonl.gz"
curl -s -f "${URL}" -o "${TARGET_DIR}/as-org2info.jsonl.gz"
gzip -fd ${TARGET_DIR}/as-org2info.jsonl.gz

# IPVx to ASN Map
rm -rf ${TARGET_DIR}/GeoLite2-ASN-CSV_*
URL="https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN-CSV&license_key=${MAXMIND_KEY}&suffix=zip"
curl -s -f "${URL}" -o "${TARGET_DIR}/GeoLite2-ASN-CSV.zip"
unzip -o -d ${TARGET_DIR} ${TARGET_DIR}/GeoLite2-ASN-CSV.zip
cp ${TARGET_DIR}/GeoLite2-ASN-CSV_*/*IPv4.csv ${TARGET_DIR}/
cp ${TARGET_DIR}/GeoLite2-ASN-CSV_*/*IPv6.csv ${TARGET_DIR}/

rm -r $(ls -d ${TARGET_DIR}/GeoLite2-ASN-CSV_*)
rm $(ls ${TARGET_DIR}/*.zip)