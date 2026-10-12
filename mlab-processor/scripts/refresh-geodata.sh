#!/usr/bin/env bash
#
# refresh-geodata.sh — refresh the processor's IP geolocation inputs (idempotent).
#
# Usage:
#   refresh-geodata.sh ENV_FILE INPUT_DIR
#
#   ENV_FILE   KEY=VALUE file (systemd EnvironmentFile style, e.g.
#              /opt/broadbandmapping/processor_env) providing MAXMIND_ACCOUNT_ID and
#              MAXMIND_LICENSE_KEY. It is parsed, never sourced/executed.
#   INPUT_DIR  the processor's input directory (e.g. /opt/broadbandmapping/input).
#
# What it does:
#   1. For GeoLite2-City-CSV and GeoLite2-ASN-CSV: downloads the .sha256 from
#      https://download.maxmind.com/geoip/databases/<edition>/download?suffix=zip.sha256
#      (HTTP basic auth MAXMIND_ACCOUNT_ID:MAXMIND_LICENSE_KEY). If the hash equals the one
#      recorded in INPUT_DIR/VERSIONS and the CSVs are present, the edition is skipped.
#      Otherwise downloads the zip, verifies the sha256, unzips and checks the
#      GeoLite2-{City,ASN}-Blocks-IPv{4,6}.csv files (header has "network", minimum row count).
#   2. Fetches the newest publicdata.caida.org/datasets/as-organizations/YYYYMMDD.as-org2info.jsonl.gz
#      (skipped when VERSIONS already has that file), checks it, installs it as
#      as-org2info.jsonl.
#   3. Installs each file atomically (temp file in INPUT_DIR + rename) after copying the
#      current one to INPUT_DIR/previous/ (one previous copy is kept), then rewrites
#      INPUT_DIR/VERSIONS (KEY=VALUE: <edition>=<release name>, <edition>_SHA256=..., CAIDA=...,
#      UPDATED=<UTC timestamp>) when anything changed.
#
# Exit status: 0 when everything is current (refreshed or already up to date), non-zero on
# any failure; on failure the installed files are left as they were.
# Credentials go to curl through a config on stdin (never on the command line, never
# printed). Run as a user that can read ENV_FILE and write INPUT_DIR (root on mapping-db).
# The processor reads the files only at start; schedule this outside the processor's run
# window (e.g. monthly, midday). Concurrent runs of this script are serialized with flock.
#
# Requires: bash, curl, sha256sum, unzip, gzip, flock, awk, sed, grep.

set -euo pipefail
umask 022

if [[ $# -ne 2 ]]; then
    echo "usage: $0 ENV_FILE INPUT_DIR" >&2
    exit 2
fi
ENV_FILE=$1
INPUT_DIR=$2

MAXMIND_BASE=${MAXMIND_BASE:-https://download.maxmind.com/geoip/databases}
CAIDA_BASE=${CAIDA_BASE:-https://publicdata.caida.org/datasets/as-organizations}
# Minimum data rows per CSV; far below the real sizes (City v4 ~5.7M, ASN v4 ~1.1M rows),
# but enough to reject an empty or truncated release.
declare -A MIN_ROWS=(
    [GeoLite2-City-Blocks-IPv4.csv]=1000000
    [GeoLite2-City-Blocks-IPv6.csv]=200000
    [GeoLite2-ASN-Blocks-IPv4.csv]=200000
    [GeoLite2-ASN-Blocks-IPv6.csv]=50000
)
MIN_CAIDA_LINES=50000
# For tests only: one minimum for every file.
if [[ -n ${MIN_ROWS_OVERRIDE:-} ]]; then
    for k in "${!MIN_ROWS[@]}"; do MIN_ROWS[$k]=$MIN_ROWS_OVERRIDE; done
    MIN_CAIDA_LINES=$MIN_ROWS_OVERRIDE
fi
CHANGED=0

log() { echo "refresh-geodata: $*" >&2; }
die() { log "ERROR: $*"; exit 1; }

[[ -r $ENV_FILE ]] || die "cannot read env file $ENV_FILE"
[[ -d $INPUT_DIR && -w $INPUT_DIR ]] || die "input dir $INPUT_DIR missing or not writable"

# Read KEY=VALUE without executing the file; strips optional quotes and "export ".
env_value() {
    local key=$1
    sed -n -E "s/^[[:space:]]*(export[[:space:]]+)?${key}[[:space:]]*=[[:space:]]*//p" "$ENV_FILE" \
        | tail -n 1 | sed -E 's/^"(.*)"$/\1/; s/^'"'"'(.*)'"'"'$/\1/'
}
MM_ACCOUNT=$(env_value MAXMIND_ACCOUNT_ID)
MM_KEY=$(env_value MAXMIND_LICENSE_KEY)
[[ -n $MM_ACCOUNT && -n $MM_KEY ]] || die "MAXMIND_ACCOUNT_ID / MAXMIND_LICENSE_KEY not set in $ENV_FILE"

exec 9>"$INPUT_DIR/.refresh-geodata.lock"
flock -n 9 || die "another refresh is running"

STAGING=$(mktemp -d "$INPUT_DIR/.refresh-geodata.XXXXXX")
trap 'rm -rf "$STAGING"' EXIT

VERSIONS="$INPUT_DIR/VERSIONS"
declare -A NEWV=()
if [[ -f $VERSIONS ]]; then
    while IFS='=' read -r k v; do
        [[ -n $k && $k != \#* ]] && NEWV[$k]=$v
    done <"$VERSIONS"
fi

# curl with MaxMind basic auth passed via a config file on stdin (keeps it out of argv).
mm_curl() {
    local url=$1 out=$2
    printf 'user = "%s:%s"\n' "$MM_ACCOUNT" "$MM_KEY" |
        curl --config - --fail --silent --show-error --location \
            --retry 3 --retry-delay 10 --connect-timeout 30 --max-time 1800 \
            --output "$out" "$url"
}

pub_curl() {
    curl --fail --silent --show-error --location --retry 3 --retry-delay 10 \
        --connect-timeout 30 --max-time 1800 "$@"
}

# check_csv FILE MINROWS: header must contain "network", enough rows.
check_csv() {
    local f=$1 min=$2
    head -n 1 "$f" | grep -q '^network,' || die "$(basename "$f"): unexpected header"
    local rows
    rows=$(($(wc -l <"$f") - 1))
    ((rows >= min)) || die "$(basename "$f"): only $rows rows (expected >= $min)"
    log "$(basename "$f"): $rows rows OK"
}

# install_file SRC NAME: keep the current INPUT_DIR/NAME as previous/NAME, then replace it
# atomically with SRC (rename within INPUT_DIR).
install_file() {
    local src=$1 name=$2
    local dst="$INPUT_DIR/$name"
    mkdir -p "$INPUT_DIR/previous"
    if [[ -f $dst ]]; then
        cp -p "$dst" "$INPUT_DIR/previous/.$name.tmp"
        mv -f "$INPUT_DIR/previous/.$name.tmp" "$INPUT_DIR/previous/$name"
    fi
    cp "$src" "$INPUT_DIR/.$name.tmp"
    chmod 0644 "$INPUT_DIR/.$name.tmp"
    mv -f "$INPUT_DIR/.$name.tmp" "$dst"
    log "installed $name"
}

refresh_maxmind() {
    local edition=$1 prefix=$2 # prefix: GeoLite2-City / GeoLite2-ASN
    local dir="$STAGING/$edition"
    mkdir -p "$dir"
    mm_curl "$MAXMIND_BASE/$edition/download?suffix=zip.sha256" "$dir/sha256" ||
        die "$edition: downloading the sha256 failed"
    local want zipname
    want=$(awk '{print $1; exit}' "$dir/sha256")
    zipname=$(awk '{print $2; exit}' "$dir/sha256")
    [[ $want =~ ^[0-9a-f]{64}$ ]] || die "$edition: malformed sha256 file"
    local release=${zipname%.zip}

    local present=1
    for v in IPv4 IPv6; do
        [[ -s "$INPUT_DIR/$prefix-Blocks-$v.csv" ]] || present=0
    done
    if [[ ${NEWV[${edition}_SHA256]:-} == "$want" && $present == 1 ]]; then
        log "$edition: $release already installed"
        return 0
    fi

    log "$edition: downloading $release"
    mm_curl "$MAXMIND_BASE/$edition/download?suffix=zip" "$dir/db.zip" ||
        die "$edition: download failed"
    local got
    got=$(sha256sum "$dir/db.zip" | awk '{print $1}')
    [[ $got == "$want" ]] || die "$edition: sha256 mismatch (got $got, want $want)"
    unzip -q "$dir/db.zip" -d "$dir/x" || die "$edition: unzip failed"

    for v in IPv4 IPv6; do
        local name="$prefix-Blocks-$v.csv" f
        f=$(find "$dir/x" -type f -name "$name" | head -n 1)
        [[ -n $f ]] || die "$edition: $name not in the archive"
        check_csv "$f" "${MIN_ROWS[$name]}"
        mv "$f" "$dir/$name"
    done
    for v in IPv4 IPv6; do
        install_file "$dir/$prefix-Blocks-$v.csv" "$prefix-Blocks-$v.csv"
    done
    NEWV[$edition]=$release
    NEWV[${edition}_SHA256]=$want
    CHANGED=1
}

refresh_caida() {
    local dir="$STAGING/caida"
    mkdir -p "$dir"
    pub_curl --output "$dir/index.html" "$CAIDA_BASE/" || die "CAIDA: listing failed"
    local newest
    newest=$(grep -oE '[0-9]{8}\.as-org2info\.jsonl\.gz' "$dir/index.html" | sort -u | tail -n 1)
    [[ -n $newest ]] || die "CAIDA: no YYYYMMDD.as-org2info.jsonl.gz in the listing"
    if [[ ${NEWV[CAIDA]:-} == "$newest" && -s "$INPUT_DIR/as-org2info.jsonl" ]]; then
        log "CAIDA: $newest already installed"
        return 0
    fi
    log "CAIDA: downloading $newest"
    pub_curl --output "$dir/$newest" "$CAIDA_BASE/$newest" || die "CAIDA: download failed"
    gzip -t "$dir/$newest" || die "CAIDA: corrupt gzip"
    gzip -dc "$dir/$newest" >"$dir/as-org2info.jsonl"
    local lines orgs
    lines=$(wc -l <"$dir/as-org2info.jsonl")
    orgs=$(grep -c '"type":"Organization"' "$dir/as-org2info.jsonl" || true)
    ((lines >= MIN_CAIDA_LINES && orgs > 0)) || die "CAIDA: unexpected content ($lines lines, $orgs organizations)"
    log "CAIDA: $lines lines OK"
    install_file "$dir/as-org2info.jsonl" as-org2info.jsonl
    NEWV[CAIDA]=$newest
    CHANGED=1
}

refresh_maxmind GeoLite2-City-CSV GeoLite2-City
refresh_maxmind GeoLite2-ASN-CSV GeoLite2-ASN
refresh_caida

if [[ $CHANGED == 0 && -f $VERSIONS ]]; then
    log "everything up to date"
    exit 0
fi
NEWV[UPDATED]=$(date -u +%Y-%m-%dT%H:%M:%SZ)
{
    echo "# written by refresh-geodata.sh; do not edit"
    for k in $(printf '%s\n' "${!NEWV[@]}" | sort); do
        echo "$k=${NEWV[$k]}"
    done
} >"$STAGING/VERSIONS"
install_file "$STAGING/VERSIONS" VERSIONS
log "done"
