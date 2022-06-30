# M-LAB Processor

ETL service that processes the raw data from M-Lab's web-100, NDT5 and NDT7 speed-tests, flattening them into a single file for each day as well as including geo information based on a geoip and then applying the lat/longs against provided shapes.

## SETUP

1. Download the necessary shapes:

`./scripts/download_shapes.sh`

2. Download the ASN Maps:

`./scripts/download_asn_maps.sh`

>Note: For downloading IPV4/IPV6 to ASN map you must have a [Maxmind](https://www.maxmind.com/) License Key and set it as an environment variable named `MAXMIND_KEY`


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

Locate the tests against shapes files by using the Latitude/Logitude found from the previous step
