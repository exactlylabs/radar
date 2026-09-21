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

    def get_projection(study_aggregate_id, parent_aggregate_id, as_org_id)
      proj = @consumer_offset.state["projections"]["#{study_aggregate_id}-#{as_org_id}"]
      if proj.nil?
        proj = {
          "parent_aggregate_id" => parent_aggregate_id,
          "study_aggregate_id" => study_aggregate_id,
          "autonomous_system_org_id" => as_org_id,
          "online_pods_count" => 0,
          "online_locations_count" => 0,
          "measurements_count" => 0,
          "points_with_tests_count" => 0,
          "completed_locations_count" => 0,
          "completed_and_online_locations_count" => 0,
        }
        @consumer_offset.state["projections"]["#{study_aggregate_id}-#{as_org_id}"] = proj
      end
      return proj
    end

    # One tree per study of the point. A point whose shapes belong to no study returns [].
    def get_aggregates_for_point(longitude, latitude, as_org_id, as_org_name, **opts)
      @aggregates_cache ||= {}
      return [] if longitude.nil?

      key = "#{latitude}-#{longitude}-#{as_org_id}"
      if @aggregates_cache[key].nil?
        Rails.logger.debug "Loading Geospaces for point #{latitude}, #{longitude}, #{opts}"
        t = Time.now
        geospaces = load_geospaces_for_point(longitude, latitude, **opts)
        Rails.logger.debug "Loaded Geospaces in #{Time.now - t} seconds"

        @aggregates_cache[key] = studies_for(geospaces).flat_map do |study|
          build_study_tree(study, geospaces, as_org_id, as_org_name)
        end
      end
      return @aggregates_cache[key].dup
    end

    # The study-only state aggregate counts a point only when the point sits in a study county of the same study.
    def aggregates_to_count(aggs)
      aggs.reject do |agg|
        agg.level == 'state_with_study_only' &&
          aggs.none? { |a| a.level == 'county' && a.study_aggregate && a.study_id == agg.study_id }
      end
    end

    def completion_days_for(aggregate)
      @studies_by_id.fetch(aggregate.study_id).completion_days
    end

    def completion_thresholds
      @completion_thresholds ||= @studies_by_id.values.map(&:completion_days).uniq
    end

    def get_location_metadata(location_id)
      @location_metadatas["#{location_id}"] ||= LocationMetadataProjection.find_or_create_by!(location_id: location_id)
    end

    def load_location_metadatas()
      meta = {}
      LocationMetadataProjection.all.each do |lm|
        meta["#{lm.location_id}"] = lm
      end
      meta
    end

    private

    def studies_for(geospaces)
      geospaces.flat_map { |g| g["study_ids"] }.uniq.map { |id| @studies_by_id.fetch(id) }
    end

    def build_study_tree(study, geospaces, as_org_id, as_org_name)
      state = geospaces.find { |g| g["ns"] == "state" }
      return [] if state.nil?

      aggs = []
      state_agg = load_aggregate(study, 'state', state, parent: nil)
      aggs << state_agg
      aggs << load_aggregate(study, 'state_with_study_only', state, parent: nil)

      county = geospaces.find { |g| g["ns"] == "county" }
      return aggs if county.nil?

      county_agg = load_aggregate(study, 'county', county, parent: state_agg)
      aggs << county_agg

      if study.level_isp_county && as_org_id.present?
        aggs << load_aggregate(study, 'isp_county', county, parent: state_agg, as_org_id: as_org_id, as_org_name: as_org_name)
      end

      if study.level_census_place
        place = geospaces.find { |g| g["ns"] == "census_place" }
        aggs << load_aggregate(study, 'census_place', place, parent: county_agg, study_shape: county_agg.study_aggregate) if place
      end

      if study.level_census_tract
        tract = geospaces.find { |g| g["ns"] == "census_tract" && g["study_ids"].include?(study.id) }
        aggs << load_aggregate(study, 'census_tract', tract, parent: county_agg) if tract
      end

      if study.level_zip
        zip = geospaces.find { |g| g["ns"] == "zip" && g["study_ids"].include?(study.id) }
        aggs << load_aggregate(study, 'zip', zip, parent: state_agg) if zip
      end

      aggs
    end

    def load_aggregate(study, level, geospace, parent:, as_org_id: nil, as_org_name: nil, study_shape: nil)
      study_shape = geospace["study_ids"].include?(study.id) if study_shape.nil?
      name = level == 'isp_county' ? StudyAggregate.isp_county_name(as_org_name, geospace["name"]) : geospace["name"]
      StudyAggregate.find_or_create_for!(
        study: study, level: level, geospace_id: geospace["id"], name: name,
        parent: parent, study_shape: study_shape, autonomous_system_org_id: as_org_id
      )
    end

    def load_geospaces_for_point(longitude, latitude, **opts)
      scope =
        if opts[:location].present?
          opts[:location].geospaces
        elsif opts[:location_id].present?
          Geospace.joins(:locations).where("locations.id = ?", opts[:location_id])
        else
          Geospace.containing_point(longitude, latitude)
        end

      scope.includes(:studies).map do |geospace|
        {
          "id" => geospace.id, "ns" => geospace.namespace, "name" => geospace.name,
          "study_ids" => geospace.studies.map(&:id),
        }
      end
    end

    def location_lonlat(location_id)
      if @lonlats[location_id].nil?
        begin
          location = Location.with_deleted.find(location_id)
        rescue ActiveRecord::RecordNotFound
          return
        end
        @lonlats[location_id] = location.lonlat
      end
      @lonlats[location_id]
    end
  end
end
