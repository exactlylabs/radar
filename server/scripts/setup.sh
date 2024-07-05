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
URL="https://publicdata.caida.org/datasets/as-organizations"
FILE=$(curl -s -L $URL | grep -o '".*.jsonl.gz"' | sed 's/"//g' | sort | tail -n 1)
FILE_DATE=$(echo ${FILE} | sed 's/\..*//') # Drop anything after the first dot
curl -s -f "${URL}/${FILE}" -o "${TARGET_DIR}/as-org2info.jsonl.gz"
gzip -fd ${TARGET_DIR}/as-org2info.jsonl.gz
echo -n ${FILE_DATE} > ${TARGET_DIR}/.as-org2info_version

# IPVx to ASN Map
rm -rf ${TARGET_DIR}/GeoLite2-ASN-CSV_*
URL="https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN-CSV&license_key=${MAXMIND_KEY}&suffix=zip"
curl -L -s -f "${URL}" -o "${TARGET_DIR}/GeoLite2-ASN-CSV.zip"
unzip -o -d ${TARGET_DIR} ${TARGET_DIR}/GeoLite2-ASN-CSV.zip
cp ${TARGET_DIR}/GeoLite2-ASN-CSV_*/*IPv4.csv ${TARGET_DIR}/
cp ${TARGET_DIR}/GeoLite2-ASN-CSV_*/*IPv6.csv ${TARGET_DIR}/

FILE_DATE=$(ls -d ${TARGET_DIR}/GeoLite2-ASN-CSV_* | sed 's/.*_//')
echo -n $FILE_DATE > ${TARGET_DIR}/.geo_lite2_version

rm -r $(ls -d ${TARGET_DIR}/GeoLite2-ASN-CSV_*)
rm $(ls ${TARGET_DIR}/*.zip)
