module StudyMetricsProjectionProcessor
  module Common
    def as_org_info(autonomous_system_id)
      if autonomous_system_id.nil?
        return nil, nil
      end
      @as_orgs_cache ||= {}
      if @as_orgs_cache[autonomous_system_id].nil?
        as_org_id, as_org_name = AutonomousSystem.joins(:autonomous_system_org).where("autonomous_systems.id = ?", autonomous_system_id).pluck(
          "autonomous_system_orgs.id, autonomous_system_orgs.name"
        ).first
        @as_orgs_cache[autonomous_system_id] = [as_org_id, as_org_name]
      end
      return @as_orgs_cache[autonomous_system_id]
    end

    def get_aggregates_for_point(lonlat, as_org_id, as_org_name, **opts)
      @aggregates_cache ||= {}
      return [] if lonlat.nil?
      aggs = @aggregates_cache["#{lonlat.latitude}-#{lonlat.longitude}-#{as_org_id}"].dup || []
      if aggs.size == 0
        geospaces = load_geospaces_for_point(lonlat, **opts)

        state_agg = load_state_aggregate(geospaces)
        aggs << state_agg if state_agg

        county_agg = load_county_aggregate(geospaces, state_agg)
        aggs << county_agg if county_agg

        isp_county_agg = load_isp_county_aggregate(geospaces, state_agg, as_org_id, as_org_name)
        aggs << isp_county_agg if isp_county_agg

        census_place_agg = load_census_place_aggregate(geospaces, county_agg)
        aggs << census_place_agg if census_place_agg

        @aggregates_cache["#{lonlat.latitude}-#{lonlat.longitude}-#{as_org_id}"] = aggs
      end
      return aggs
    end

    def get_location_metadata(location_id, as_org_id)
      meta = @location_metadatas["#{location_id}-#{as_org_id}"]
      if meta.nil?
        meta = LocationMetadataProjection.find_or_create_by!(location_id: location_id, autonomous_system_org_id: as_org_id)
        @location_metadatas["#{location_id}-#{as_org_id}"] = meta
      end
      return meta
    end

    private

    def load_state_aggregate(geospaces)
      state = geospaces.find {|g| g["ns"] == "state"}
      if state
        return StudyAggregate.find_or_create_by!(
          name: state["name"], level: 'state', geospace_id: state["id"], study_aggregate: state["study_geospace"]
        )
      end
      return nil
    end

    def load_county_aggregate(geospaces, state_agg)
      county = geospaces.find {|g| g["ns"] == "county"}
      if county && state_agg
        return StudyAggregate.find_or_create_by!(
          name: county["name"], level: 'county', parent_aggregate: state_agg, geospace_id: county["id"],
          study_aggregate: county["study_geospace"]
        )
      end
      return nil
    end

    def load_isp_county_aggregate(geospaces, state_agg, as_org_id, as_org_name)
      if as_org_id.present?
        county = geospaces.find {|g| g["ns"] == "county"}
        if county && state_agg
          return StudyAggregate.find_or_create_by!(
            name: "#{as_org_name} -> #{county["name"]}", level: 'isp_county', autonomous_system_org_id: as_org_id,
            parent_aggregate: state_agg, geospace_id: county["id"], study_aggregate: county["study_geospace"],
          )
        end
      end
      return nil
    end

    def load_census_place_aggregate(geospaces, county_agg)
      census_place = geospaces.find {|g| g["ns"] == "census_place"}
      if census_place && county_agg
        return StudyAggregate.find_or_create_by!(
          name: census_place["name"], level: 'census_place', parent_aggregate: county_agg, geospace_id: census_place["id"],
          study_aggregate: county_agg["study_aggregate"]
        )
      end
      return nil
    end

    def load_geospaces_for_point(lonlat, **opts)
      geospaces = []
      if opts[:location].present?
        opts[:location].geospaces.each do |geospace|
          geospaces << {
            "id" => geospace.id, "ns" => geospace.namespace, "name" => geospace.name, "study_geospace" => geospace.study_geospace
          }
        end
      elsif opts[:location_id].present?
        Geospace.joins(:locations).where("locations.id = ?", opts[:location_id]).each do |geospace|
          geospaces << {
            "id" => geospace.id, "ns" => geospace.namespace, "name" => geospace.name, "study_geospace" => geospace.study_geospace
          }
        end
      else
        Geospace.containing_lonlat(lonlat).each do |geospace|
          geospaces << {
            "id" => geospace.id, "ns" => geospace.namespace, "name" => geospace.name, "study_geospace" => geospace.study_geospace
          }
        end
      end
      return geospaces
    end
  end
end
