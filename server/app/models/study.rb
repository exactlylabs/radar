class Study < ApplicationRecord
  has_and_belongs_to_many :geospaces
  has_many :study_aggregates

  validates :name, presence: true, uniqueness: true
  validates :completion_days, numericality: { only_integer: true, greater_than: 0 }

  # Creates the aggregate rows for every tagged shape, so the dashboard lists them before any pod
  # reports from there. Counties and tracts are matched to their parent by geoid prefix; places and
  # ZIPs by geometry. Only creates rows; tagging shapes into the study is the seed's job.
  def populate_aggregates!
    geospaces.states.find_each do |state|
      state_agg = aggregate!('state', state, parent: nil)
      aggregate!('state_with_study_only', state, parent: nil)

      geospaces.counties.where("geoid LIKE ?", "#{state.geoid}%").find_each do |county|
        county_agg = aggregate!('county', county, parent: state_agg)
        populate_isp_county!(county, state_agg) if level_isp_county
        if level_census_place
          geospaces.census_places.where(Geospace.arel_table[:geom].st_intersects(county.geom)).find_each do |place|
            aggregate!('census_place', place, parent: county_agg)
          end
        end
        if level_census_tract
          geospaces.census_tracts.where("geoid LIKE ?", "#{county.geoid}%").find_each do |tract|
            aggregate!('census_tract', tract, parent: county_agg)
          end
        end
      end

      if level_zip
        geospaces.zips.where(Geospace.arel_table[:geom].st_intersects(state.geom)).find_each do |zip|
          aggregate!('zip', zip, parent: state_agg)
        end
      end
    end
  end

  private

  def aggregate!(level, shape, parent:, autonomous_system_org: nil)
    name = autonomous_system_org ? StudyAggregate.isp_county_name(autonomous_system_org.name, shape.name) : shape.name
    StudyAggregate.find_or_create_for!(
      study: self, level: level, geospace_id: shape.id, name: name, parent: parent, study_shape: true,
      autonomous_system_org_id: autonomous_system_org&.id
    )
  end

  def populate_isp_county!(county, state_agg)
    GeoTools.get_county_as_orgs(county.geoid).each do |org|
      as_org = AutonomousSystemOrg.find_or_create_by!(name: org.name)
      aggregate!('isp_county', county, parent: state_agg, autonomous_system_org: as_org)
    end
  end
end
