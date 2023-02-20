CREATE TABLE study_zips AS
  SELECT zip_county_crosswalk.zip, study_counties.fips, study_counties.state, study_counties.county
  FROM zip_county_crosswalk
  JOIN study_counties ON zip_county_crosswalk.county = study_counties.fips
