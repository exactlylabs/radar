class StudyAggregate < ActiveRecord::Base
  belongs_to :geospace
  belongs_to :autonomous_system_org, optional: true
  belongs_to :parent_aggregate, class_name: 'StudyAggregate', optional: true
  has_many :study_aggregates, foreign_key: :parent_aggregate_id
  has_many :study_level_projections
  has_many :study_level_measurements_projections


  def self.populate_from_geospaces!
    fips = ActiveRecord::Base.connection.execute("SELECT fips FROM study_counties").values.flatten
    state_fips = ActiveRecord::Base.connection.execute("SELECT DISTINCT(state_fips) FROM us_states JOIN study_counties ON study_counties.state_code = us_states.state_code ").values.flatten
    geospaces = Geospace.arel_table
    Geospace.where(geoid: state_fips).each do |state|
      state_agg = StudyAggregate.find_or_create_by!(
        name: state.name,
        geospace: state, 
        level: 'state'
      )
      # Do it outside find_or_create_by, because it could have been already created
      state_agg.update(study_aggregate: true)
      
      Geospace.where(geoid: fips, namespace: 'county').where(geospaces[:geom].st_intersects(state.geom)).each do |county|
        county_agg = StudyAggregate.find_or_create_by!(
          name: county.name,
          geospace: county, 
          level: 'county',
          parent_aggregate: state_agg
        )
        county_agg.update(study_aggregate: true)
        Geospace.where(namespace: 'census_place').where(geospaces[:geom].st_intersects(county.geom)).each do |place|
          place_agg = StudyAggregate.find_or_create_by!(
            name: place.name,
            geospace: place, 
            level: 'census_place',
            parent_aggregate: county_agg
          )
          place_agg.update(study_aggregate: true)
        end
        GeoTools.get_county_as_orgs(county.geoid).each do |org|
          as_org = AutonomousSystemOrg.find_or_create_by!(name: org.name)  
          isp_county_agg = StudyAggregate.find_or_create_by!(
            name: "#{org.name} -> #{county.name}",
            autonomous_system_org_id: as_org.id,
            geospace_id: county.id,
            level: 'isp_county',
            parent_aggregate: state_agg
          )
          isp_county_agg.update(study_aggregate: true)
        end
      end
    end 
  end
end

