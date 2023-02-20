CREATE TABLE phycomp_in_study_area AS (
  SELECT
  	phycomp_by_npi.*,
  	study_zips.fips AS study_fips,
  	study_zips.state as study_state,
  	study_zips.county as study_county
  FROM phycomp_by_npi
  JOIN study_zips
  ON LEFT(phycomp_by_npi.zip, 5) = study_zips.zip
)