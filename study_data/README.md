
This depends on https://github.com/bloomapi/rapidcsv being installed in the path and a local postgres DB called "workspace" being created with the current user not needing username / password to connect to the local db. It also depends on `ogr2ogr` from the GDal package

* hud-q4-2021-zip-county-crosswalk.csv is from https://www.huduser.gov/portal/datasets/usps_crosswalk.html on Feb 20, 2023 selecting Q4 2021 and "ZIP-COUNTY" to download. Columns usps_zip_pref_city	usps_zip_pref_state	res_ratio	bus_ratio	oth_ratio	and tot_ratio manually deleted before exporting xlsx as csv and gziping.
* public_study_counties_export_2023-02-20_131401.csv was manually created by building a list of FIPs for the study areas in scope for this grant + joining that data to census populations for those counties.
* Must manually convert sources/working/EDGE_GEOCODE_PUBLICSCH_2122/EDGE_GEOCODE_PUBLICSCH_2122.xlsx to CSV after running script once. Save csv with file name sources/working/EDGE_GEOCODE_PUBLICSCH_2122/EDGE_GEOCODE_PUBLICSCH_2122.csv
  


* Physician compare downloaded