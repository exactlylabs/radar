# M-LAB Processor

ETL service that processes the raw data from M-Lab's web-100, NDT5 and NDT7 speed-tests, flattening them into a single file for each day as well as including geo information based on a geoip and then applying the lat/longs against provided shapes.

## SETUP

1. Download the necessary shapes:

`./scripts/download_shapes.sh`

2. Download the GeoLite2 CSVs and the CAIDA AS-organization map (idempotent; also the
   monthly refresh on the server):

`./scripts/refresh-geodata.sh /path/to/env_file ./input`

>Note: the env file must define `MAXMIND_ACCOUNT_ID` and `MAXMIND_LICENSE_KEY` ([Maxmind](https://www.maxmind.com/) account). See the header of the script.


Bellow are some details about the setup data and where you can get it manually.

### GeoLite IPs to ASNs

Here we have databases that map an IP to a specific ASN that owns this IP range.
This data is retrieved from [Maxmind](https://www.maxmind.com/)


### ASN to Organization Database:

Maps an ASN code to the organization responsible for it, with a user-friendly name.
This dataset was taken from [CAIDA](https://www.caida.org/), you can download the latest `.jsonl` file [here](https://publicdata.caida.org/datasets/as-organizations/)


### Shape Files

Shape files are all retrieved from [US Census](https://www2.census.gov/geo/tiger/TIGER2021/)



## Processing Steps

### Fetch

Download all speedtests of given days from mlab's bucket and flattens it into an avro file per day.

### IP Geocoder

Complements the Fetch data by obtaining the Latitude, Longitude and ISP name based on the IP of the tests

### Reverse Geocode

Locate the tests against shapes files by using the Latitude/Logitude found from the previous step.
Only the namespaces the ingestor reads are loaded (US_STATES, US_COUNTIES, US_AIANNH).

## Running

- `mlab-processor` (cmd/processor): one-shot, meant for a daily systemd timer. Processes
  today-2 and re-checks the 7 days before it: a date is (re)processed when it has no
  `completeness/<date>.json` record in the storage or when M-Lab's archive now lists more
  tarballs than were processed. Exit status 1 if any date failed. `-from D` for a catch-up,
  `-check-only` to see the decisions, `-loop` for the old resident nightly loop.
- `process-mlab` (cmd/process): manual runs, e.g.
  `process-mlab -start 2025-02-05 -end 2025-02-05 -rerun -storage b2 all`.

Every step logs one `SUMMARY date=... step=... status=...` line per date. A fetch fails the
date (nothing uploaded) when a tarball still fails after 3 attempts.

