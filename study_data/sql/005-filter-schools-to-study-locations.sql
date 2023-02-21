CREATE TABLE study_schools AS (
  SELECT
    ncessch,
    public_schools.leaid,
    public_schools.name as school_name,
    school_districts.name as school_district,
    public_schools.lat,
    public_schools.lon,
    public_schools.street,
    public_schools.city,
    public_schools.state,
    public_schools.zip,
    study_counties.fips,
    study_counties.county
  FROM public_schools
  JOIN study_counties
  ON public_schools.cnty = study_counties.fips
  LEFT OUTER JOIN school_districts
  ON school_districts.leaid = public_schools.leaid
)
