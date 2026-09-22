module StudyMetricsProjectionProcessor
  module Common
    # The fields the processor reads from a study aggregate row. One shared instance per row.
    Aggregate = Struct.new(:id, :parent_aggregate_id, :level, :study_id, :study_aggregate, :name, keyword_init: true)

    # Prepared once per connection, so Postgres keeps the plan and only the point travels.
    GEOSPACES_CONTAINING_POINT_SQL = <<~SQL.freeze
      SELECT id, namespace, name FROM geospaces
      WHERE ST_Contains(ST_SetSRID(geom, 4326), ST_SetSRID(ST_MakePoint($1, $2), 4326))
    SQL

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
      return [] if longitude.nil?

      key = [longitude, latitude, as_org_id]
      @aggregates_cache[key] ||= begin
        geospaces = geospaces_for_point(longitude, latitude, **opts)
        studies_for(geospaces).flat_map { |study| build_study_tree(study, geospaces, as_org_id, as_org_name) }
      end
      @aggregates_cache[key].dup
    end

    # Shapes are cached per point, so a new ISP at a known point costs no query.
    def geospaces_for_point(longitude, latitude, **opts)
      @geospaces_by_point[[longitude, latitude]] ||= begin
        Rails.logger.debug { "Loading Geospaces for point #{latitude}, #{longitude}, #{opts}" }
        load_geospaces_for_point(longitude, latitude, **opts).map do |id, namespace, name|
          { "id" => id, "ns" => namespace, "name" => name, "study_ids" => @study_ids_by_geospace.fetch(id, []) }
        end
      end
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

    def load_study_ids_by_geospace
      Study.joins(:geospaces).pluck("geospaces.id", "studies.id")
        .group_by(&:first).transform_values { |pairs| pairs.map(&:last) }
    end

    def load_aggregates_by_identity
      StudyAggregate.all.each_with_object({}) do |row, map|
        map[[row.study_id, row.level, row.geospace_id, row.autonomous_system_org_id, row.parent_aggregate_id]] = aggregate_from(row)
      end
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

    # Rows are looked up in memory. The database is touched only for a new row, or when tagging a shape
    # into a study later changed its name or study flag, which find_or_create_for! flips in place.
    def load_aggregate(study, level, geospace, parent:, as_org_id: nil, as_org_name: nil, study_shape: nil)
      study_shape = geospace["study_ids"].include?(study.id) if study_shape.nil?
      name = level == 'isp_county' ? StudyAggregate.isp_county_name(as_org_name, geospace["name"]) : geospace["name"]
      key = [study.id, level, geospace["id"], as_org_id, parent&.id]
      cached = @aggregates_by_identity[key]
      return cached if cached && cached.name == name && cached.study_aggregate == study_shape

      row = StudyAggregate.find_or_create_for!(
        study: study, level: level, geospace_id: geospace["id"], name: name,
        parent: parent, study_shape: study_shape, autonomous_system_org_id: as_org_id
      )
      @aggregates_by_identity[key] = aggregate_from(row)
    end

    def aggregate_from(row)
      Aggregate.new(
        id: row.id, parent_aggregate_id: row.parent_aggregate_id, level: row.level,
        study_id: row.study_id, study_aggregate: row.study_aggregate, name: row.name
      )
    end

    # Returns [id, namespace, name] rows. Polygons are never loaded.
    def load_geospaces_for_point(longitude, latitude, **opts)
      if opts[:location].present?
        opts[:location].geospaces.pluck(:id, :namespace, :name)
      elsif opts[:location_id].present?
        Geospace.joins(:locations).where("locations.id = ?", opts[:location_id]).pluck(:id, :namespace, :name)
      else
        binds = [
          ActiveRecord::Relation::QueryAttribute.new("longitude", longitude, ActiveModel::Type::Float.new),
          ActiveRecord::Relation::QueryAttribute.new("latitude", latitude, ActiveModel::Type::Float.new),
        ]
        ActiveRecord::Base.connection.exec_query(GEOSPACES_CONTAINING_POINT_SQL, "Geospace containing point", binds, prepare: true).rows
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
