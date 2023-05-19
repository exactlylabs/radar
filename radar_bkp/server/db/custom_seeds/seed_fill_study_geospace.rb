Geospace.counties.where(geoid: Geospace::STUDY_COUNTIES_FIPS).update(study_geospace: true)
Geospace.states.where(geoid: Geospace::STUDY_STATES_FIPS).update(study_geospace: true)