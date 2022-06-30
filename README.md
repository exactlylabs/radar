# M-LAB Processor

ETL service that processes the raw data from M-Lab's web-100, NDT5 and NDT7 speed-tests, flattening them into a single file for each day as well as including geo information based on a geoip and then applying the lat/longs against provided shapes.

## SETUP

### GeoLite IPs to ASNs

Here we have databases that map an IP to a specific ASN that owns this IP range.


### ASN to Organization Database:

Maps an ASN code to the organization responsible for it, with a user-friendly name.
This dataset was taken from [CAIDA](https://www.caida.org/), you can download the latest `.jsonl` file [here](https://publicdata.caida.org/datasets/as-organizations/)

## Processing Steps

### Fetch

### IP Geocoder

Obtains the Latitude and Longitude and ISP name based on the IP of the tests

### Reverse Geocode

Locate the tests against shapes files
