CREATE TABLE phycomp_study_locations AS (
  SELECT
	count(*),
  phycomp_in_study_area.org_nm,
  phycomp_in_study_area.phn_numbr,
	phycomp_in_study_area.adr_ln_1,
  phycomp_in_study_area.adr_ln_2,
  phycomp_in_study_area.ln_2_sprs,
  phycomp_in_study_area.cty,
  phycomp_in_study_area.st,
  phycomp_in_study_area.zip
FROM phycomp_in_study_area
GROUP BY
  phycomp_in_study_area.org_nm,
  phycomp_in_study_area.phn_numbr,
	phycomp_in_study_area.adr_ln_1,
  phycomp_in_study_area.adr_ln_2,
  phycomp_in_study_area.ln_2_sprs,
  phycomp_in_study_area.cty,
  phycomp_in_study_area.st,
  phycomp_in_study_area.zip
)
