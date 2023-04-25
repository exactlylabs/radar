module StudyLevelHandler
  module Base

    private

    def get_aggregates(lonlat, as_org_id, as_org_name)
      aggs = @study_aggregates[lonlat].dup
      if aggs.blank?
        geospaces = []
        Geospace.containing_lonlat(lonlat).each do |geospace|
          geospaces << {"id" => geospace.id, "ns" => geospace.namespace, "name" => geospace.name}
        end 

        aggs = []
        # state level
        state = geospaces.find {|g| g["ns"] == "state"}
        state_agg = nil
        if state
          state_agg = StudyAggregate.find_or_create_by!(name: state["name"], level: 'state', geospace_id: state["id"]).tap do |agg|
            aggs << {"level" => "state", "aggregate_id" => agg.id, "parent_id" => nil, "name" => agg.name, "geospace_id" => agg.geospace_id}
          end
        end

        # county level
        county = geospaces.find {|g| g["ns"] == "county"}
        county_agg = nil
        if county
          county_agg = StudyAggregate.find_or_create_by!(name: county["name"], level: 'county', parent_aggregate: state_agg, geospace_id: county["id"]).tap do |agg|
            aggs << {"level" => "county", "aggregate_id" => agg.id, "parent_id" => state_agg.id, "name" => agg.name, "geospace_id" => agg.geospace_id}
          end

          # ISP-County level
          if as_org_id.present?
            StudyAggregate.find_or_create_by!(name: "#{as_org_name} -> #{county["name"]}", level: 'isp_county', autonomous_system_org_id: as_org_id, parent_aggregate: state_agg, geospace_id: county["id"]).tap do |agg|
              aggs << {"level" => "isp_county", "aggregate_id" => agg.id, "parent_id" => state_agg.id, "name" => agg.name, "geospace_id" => agg.geospace_id}
            end
          end
        end

        # census place level
        census_place = geospaces.find {|g| g["ns"] == "census_place"}
        if census_place
          StudyAggregate.find_or_create_by!(name: census_place["name"], level: 'census_place', parent_aggregate: county_agg, geospace_id: census_place["id"]).tap do |agg|
            aggs << {"level" => "census_place", "aggregate_id" => agg.id, "parent_id" => county_agg.id, "name" => agg.name, "geospace_id" => agg.geospace_id}
          end
        end
              
      elsif as_org_id.present?
        county_agg = aggs.find {|a| a["level"] == "county"}
        # ISP-County level
        if as_org_id.present?
          StudyAggregate.find_or_create_by!(name: "#{as_org_name} -> #{county_agg["name"]}", level: 'isp_county', autonomous_system_org_id: as_org_id, parent_aggregate_id: county_agg["parent_id"], geospace_id: county_agg["geospace_id"]).tap do |agg|
            aggs << {"level" => "isp_county", "aggregate_id" => agg.id, "parent_id" => agg.parent_aggregate_id, "name" => agg.name, "geospace_id" => agg.geospace_id}
          end
        end
      end
      
      return aggs
    end

    def new_projection(aggregate, lonlat, **opts)
      StudyLevelProjection.new(
        level: aggregate["level"],
        parent_aggregate_id: aggregate["parent_id"],
        study_aggregate_id: aggregate["aggregate_id"],
        autonomous_system_org_id: opts[:as_org_id],
        lonlat: opts[:lonlat],
        location_id: opts[:location_id],
        event_id: opts[:event_id],
        measurement_id: opts[:measurement_id],
        client_speed_test_id: opts[:client_speed_test_id],
      )
    end
  end
end