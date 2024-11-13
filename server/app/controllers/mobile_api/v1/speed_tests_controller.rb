module MobileApi::V1
  class SpeedTestsController < ApiController
    include VectorTiles

    def create
      @speed_test = ClientSpeedTest.new(create_params)
      @speed_test.tested_by = 1 # Exactly Labs
      @speed_test.ip = request.remote_ip
      @speed_test.user = @current_user
      @speed_test.lonlat = "POINT(#{create_params[:longitude]} #{create_params[:latitude]})"

      filename = "speed-test-#{create_params[:tested_at]}.json"
      # Compress the result file before attaching it to the measurement
      result_file = StringIO.new(ActiveSupport::Gzip.compress(create_params[:result].to_json))
      @speed_test.result.attach(io: result_file, filename: filename, content_type: 'application/json')
      @speed_test.gzip = true
      @speed_test.autonomous_system = AutonomousSystem.find_by_ip(@speed_test.ip) unless @speed_test.ip.nil?

      if @speed_test.save
        # Call process to parse JSON and seed measurement
        ProcessSpeedTestJob.perform_later(@speed_test, true)
        invalidate_cache(Namespaces::SPEED_TESTS, @speed_test.latitude, @speed_test.longitude)
        render json: serialize_speed_test(@speed_test), status: 201
      else
        return render_error_for(@speed_test)
      end
    end

    def show
      speed_test = ClientSpeedTest.find(params[:id])

      render json: serialize_speed_test(speed_test), status: 200
    end

    def isps
      bbox = params[:bbox]
      sql_params = {}

      if bbox.present? && bbox.length != 4
        return render json: {
          error: "bbox argument must be an array of size 4 [x_0, y_0, x_1, y_1]",
          error_code: "invalid"
        }, status: :unprocessable_entity

      elsif bbox.present?
        sql_params.merge!({
          bbox_x_0: params[:bbox][0],
          bbox_y_0: params[:bbox][1],
          bbox_x_1: params[:bbox][2],
          bbox_y_1: params[:bbox][3]
        })
      end

      sql = %{
        SELECT
          autonomous_system_orgs.id as "id",
          autonomous_system_orgs.name as "name"

        FROM client_speed_tests
        JOIN autonomous_systems ON autonomous_systems.id = client_speed_tests.autonomous_system_id
        JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
        WHERE
            1 = 1
            #{'AND lonlat::geometry && ST_MakeEnvelope(:bbox_x_0, :bbox_y_0, :bbox_x_1, :bbox_y_1, 4326)' if bbox.present?}
        GROUP BY 1
        ORDER BY 1
      }

      isps = ActiveRecord::Base.connection.execute(
        ActiveRecord::Base.sanitize_sql([sql, sql_params])
      )

      render json: {items: isps}, status: 200
    end

    def tiles
      x = params[:x].to_i
      y = params[:y].to_i
      z = params[:z].to_i
      sql = %{
        WITH tile_data AS (
          SELECT
            client_speed_tests.id,
            network_type,
            autonomous_system_orgs.name,
            autonomous_system_orgs.id,
            download_avg,
            upload_avg,
            COALESCE(loss, 0) as "loss",
            latency,
            ST_AsMVTGeom(
              ST_Transform(lonlat::geometry, 3857),
              ST_TileEnvelope(:z, :x, :y), -- bounds
              4096 -- extent
            ) as "geom"
          FROM client_speed_tests
          LEFT JOIN autonomous_systems ON autonomous_systems.id = client_speed_tests.autonomous_system_id
          LEFT JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
          WHERE
            client_speed_tests.lonlat::geometry && ST_Transform(ST_TileEnvelope(:z, :x, :y), 4326)
        )

        SELECT ST_AsMVT(tile_data.*, 'tests', 4096, 'geom') as mvt
        FROM tile_data
      }
      sql = ActiveRecord::Base.sanitize_sql([sql, {z: params[:z], x: params[:x], y: params[:y]}])
      @tiles = get_vector_tile(Namespaces::SPEED_TESTS, sql)

      response.headers['Content-Type'] = 'application/vnd.mapbox-vector-tile'
      response.headers['Content-Length'] = @tiles&.length&.to_s || '0'
      send_data @tiles, type: 'application/vnd.mapbox-vector-tile', disposition: 'inline'
    end

    private

    def create_params()
      params.permit(
        :tested_at, :network_type, :connection_data, :version_number, :build_number, :background_mode, :permssions,
        :latitude, :latitude_before, :latitude_after,
        :longitude, :longitude_before, :longitude_after,
        :altitude, :altitude_before, :altitude_after,
        :accuracy, :accuracy_before, :accuracy_after,
        :alt_accuracy, :alt_accuracy_before, :alt_accuracy_after,
        :floor, :floor_before, :floor_after,
        :heading, :heading_before, :heading_after,
        :speed, :speed_before, :speed_after,
        :speed_accuracy, :speed_accuracy_before, :speed_accuracy_after,
        :mobile_scan_session_id
      )
    end

    def serialize_speed_test(s)
      s.as_json(except: [:lonlat])
    end

  end
end
