# Creates the Fresno study and tags its shapes. Run after seed_fill_geospaces.rb has imported
# census tracts and ZIPs: `rails runner db/custom_seeds/seed_fresno_study.rb`.

study = Study.find_or_create_by!(name: 'fresno') do |s|
  s.completion_days = 7
  s.notifications_enabled = false
  s.level_census_tract = true
  s.level_zip = true
  s.level_isp_county = true
end

california = Geospace.states.find_by!(geoid: '06')
fresno = Geospace.counties.find_by!(geoid: '06019')
tracts = Geospace.census_tracts.where('geoid LIKE ?', '06019%')
zips = Geospace.zips.where(Geospace.arel_table[:geom].st_intersects(fresno.geom))

[california, fresno, *tracts, *zips].each do |shape|
  study.geospaces << shape unless study.geospaces.exists?(shape.id)
end
puts "Tagged #{study.geospaces.count} shapes"

Geospace.link_all_locations(Geospace.where(namespace: %w[census_tract zip]))
# study.populate_aggregates!
puts "Created #{study.study_aggregates.count} aggregates"
