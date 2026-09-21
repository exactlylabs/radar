# Tags the rural study's states and counties. Places were tagged by the original populate step and
# already live in geospaces_studies after the AddStudies migration.

study = Study.find_by!(name: "rural")
shapes = Geospace.where(namespace: "county", geoid: Geospace::STUDY_COUNTIES_FIPS)
  .or(Geospace.where(namespace: "state", geoid: Geospace::STUDY_STATES_FIPS))

shapes.find_each do |shape|
  study.geospaces << shape unless study.geospaces.exists?(shape.id)
end
puts "Tagged #{study.geospaces.count} shapes"
