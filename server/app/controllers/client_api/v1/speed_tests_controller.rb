module ClientApi
  module V1
    class SpeedTestsController < ApiController
      MIN_ZOOM = 0  # Default min zoom for most maps
      MAX_ZOOM = 24 # Default max zoom for most maps

      def create
        begin
          is_mobile = params[:mobile].present? && params[:mobile] == 'true'
          if is_mobile
            @speed_test = ClientSpeedTest.new mobile_speed_test_params
          else
            @speed_test = ClientSpeedTest.new speed_test_params
          end
          @speed_test.ip = request.remote_ip
          @speed_test.lonlat = "POINT(#{params[:speed_test][:longitude]} #{params[:speed_test][:latitude]})"
          @speed_test.connection_data = params[:connection_data]
          @speed_test.permissions = params[:permissions]
          @speed_test.tested_by = params[:client_id]
          filename = "speed-test-#{params[:timestamp]}.json"
          # Compress the result file before attaching it to the measurement
          result_file = StringIO.new(ActiveSupport::Gzip.compress(params[:result].to_json))
          @speed_test.result.attach(io: result_file, filename: filename, content_type: 'application/json')
          @speed_test.gzip = true
          @speed_test.autonomous_system = AutonomousSystem.find_by_ip(@speed_test.ip) unless @speed_test.ip.nil?  || Rails.env.development?
          @speed_test.save!
          # Call process to parse JSON and seed measurement
          ProcessSpeedTestJob.perform_later(@speed_test, is_mobile)
        rescue Exception => e
          Sentry.capture_exception(e)
          render json: { error: e.message }, status: :unprocessable_entity
          return
        end

        invalidate_cache(@speed_test) if @speed_test.latitude && @speed_test.longitude
        render json: @speed_test, status: :created
      end

      def update
        @speed_test = ClientSpeedTest.find(params[:id])
        if @speed_test.update(contact_params)
          render json: @speed_test, status: :ok
        else
          render json: @speed_test.errors, status: :unprocessable_entity
        end
      end

      def index
        @speed_tests = ClientSpeedTest.all.where('tested_by = ?', @widget_client.id)
        render json: @speed_tests
      end

      def tiles
        x = params[:x].to_i
        y = params[:y].to_i
        z = params[:z].to_i
        is_global = params[:global] || @widget_client.id == 1
        cache_key = "mvt_#{z}_#{x}_#{y}"

        if REDIS.exists?(cache_key)
          data = REDIS.get(cache_key)
        else
          sql_params = {x: x, y: y, z: z}

          sql = %{
          WITH tile_bounds AS (
            -- Get the tile envelope for a given zoom level ({{z}}), column ({{x}}), and row ({{y}})
            SELECT ST_Transform(ST_TileEnvelope(:z, :x, :y), 4326) AS geom -- Tile boundary in Web Mercator
          ),
          filtered_tests AS (
            SELECT
              client_speed_tests.id,
              latitude,
              longitude,
              network_location,
              network_type,
              state,
              city,
              street,
              "autonomous_system_orgs"."name" AS autonomous_system_org_name,
              download_avg,
              upload_avg,
              COALESCE(loss, 0) as loss,
              latency,
              ST_AsMVTGeom(
                ST_Transform(lonlat::geometry, 3857), -- Convert lon/lat to Web Mercator
                ST_TileEnvelope(:z, :x, :y), -- Tile boundary in Web Mercator
                4096, -- Tile size (in pixels)
                0, -- Buffer around the tile in pixels
                false -- Do not clip geometries
              ) AS lonlat,
              CASE
                WHEN download_avg > 100 THEN 2
                WHEN download_avg > 25 THEN 1
                ELSE 0
              END AS download_quality,
              CASE
                WHEN upload_avg > 20 THEN 2
                WHEN upload_avg > 3 THEN 1
                ELSE 0
              END AS upload_quality
            FROM client_speed_tests
            LEFT JOIN "autonomous_systems" ON "autonomous_systems"."id" = "client_speed_tests"."autonomous_system_id"
            LEFT JOIN "autonomous_system_orgs" ON "autonomous_system_orgs"."id" = "autonomous_systems"."autonomous_system_org_id"
            WHERE lonlat && (SELECT geom FROM tile_bounds)
            AND ST_Intersects(
              lonlat::geometry, -- Cast lonlat to geometry for spatial operations
              (SELECT geom FROM tile_bounds) -- Get the tile boundary for the current tile
            )
          }

          sql += " AND tested_by = #{@widget_client.id}" unless is_global

          sql += %{
            GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13
          )
          SELECT
            ST_AsMVT(tile_data.*, 'tests', 4096, 'lonlat') AS mvt -- Return as Mapbox Vector Tile (MVT)
          FROM (
            SELECT
              id, -- Speed test ID
              download_avg, -- Avg download speed
              upload_avg, -- Avg upload speed
              lonlat,
              latitude,
              longitude,
              network_location,
              network_type,
              state,
              city,
              street,
              autonomous_system_org_name,
              download_avg,
              upload_avg,
              loss,
              latency,
              -- Pulling this here to reduce complexity on the client side, plus, the mapbox/maplibre
              -- has a very unique way of handling layer styles, where doing something like a min() or max()
              -- is either very complex to follow, but also not intuitive at all. So we just give the client
              -- the correct representation for the dot's color.
              LEAST(download_quality, upload_quality) AS connection_quality
            FROM filtered_tests
            GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17
          ) AS tile_data;
          }

          query_response = ActiveRecord::Base.connection.execute(ApplicationRecord.sanitize_sql([sql, sql_params]))
          data = query_response[0]['mvt']

          # Not sure if 1 hour is the best TTL for this cache
          # I'm open to suggestions
          REDIS.set(cache_key, data, ex: 1.hour.in_seconds)
        end

        @tiles = ActiveRecord::Base.connection.unescape_bytea(data)

        response.headers['Content-Type'] = 'application/vnd.mapbox-vector-tile'
        response.headers['Content-Length'] = @tiles.length.to_s
        send_data @tiles, type: 'application/vnd.mapbox-vector-tile', disposition: 'inline'
      end

      ## New method to prevent issues migrating
      # mainly in the released app.
      # By retrieving NE and SW points of the map
      # we can respond with tests inside that bounding box
      def tests_with_bounds
        is_global = params[:global] || @widget_client.id == 1
        dots = (params[:dots] || 1500).to_i
        sw_lat = params[:sw_lat]
        sw_lng = params[:sw_lng]
        ne_lat = params[:ne_lat]
        ne_lng = params[:ne_lng]
        error = !sw_lat || !sw_lng || !ne_lat || !ne_lng
        if !error
          longs = [sw_lng, ne_lng].sort
          lats = [sw_lat, ne_lat].sort
          bbox = [longs[0], lats[0], longs[1], lats[1]]
          sql = %{
               SELECT "client_speed_tests"."id",
                      "client_speed_tests"."latitude",
                      "client_speed_tests"."longitude",
                      "client_speed_tests"."network_location",
                      "client_speed_tests"."network_type",
                      "client_speed_tests"."state",
                      "client_speed_tests"."city",
                      "client_speed_tests"."street",
                      "autonomous_system_orgs"."name" AS autonomous_system_org_name,
                      "client_speed_tests"."download_avg",
                      "client_speed_tests"."upload_avg",
                      "client_speed_tests"."loss",
                      "client_speed_tests"."latency"
                FROM "client_speed_tests"
                LEFT JOIN "autonomous_systems" ON "autonomous_systems"."id" = "client_speed_tests"."autonomous_system_id"
                LEFT JOIN "autonomous_system_orgs" ON "autonomous_system_orgs"."id" = "autonomous_systems"."autonomous_system_org_id"
                WHERE (ST_MakeEnvelope(#{bbox[0]}, #{bbox[1]}, #{bbox[2]}, #{bbox[3]}, 4326) && lonlat)
          }
          if !is_global
            sql += " AND tested_by = #{@widget_client.id}"
          end
          sql += " ORDER BY tested_at DESC LIMIT #{dots} "
          @speed_tests = ActiveRecord::Base.connection.execute(sql)
        end
        respond_to do |format|
          if error
            format.json { render json: { msg: 'Missing map bounds!' }, status: :bad_request }
          else
            format.json { render json: format_json(@speed_tests), status: :ok }
          end
        end
      end

      private

      def contact_params
        params.require(:speed_test).permit(:client_email, :client_phone, :client_first_name, :client_last_name)
      end

      def format_json(speed_tests)
        speed_tests.map do |speed_test|
          {
            id: speed_test['id'],
            latitude: speed_test['latitude'],
            longitude: speed_test['longitude'],
            network_location: speed_test['network_location'],
            network_type: speed_test['network_type'],
            state: speed_test['state'],
            city: speed_test['city'],
            street: speed_test['street'],
            download_avg: speed_test['download_avg'],
            upload_avg: speed_test['upload_avg'],
            loss: speed_test['loss'],
            latency: speed_test['latency'],
            autonomous_system: {
              autonomous_system_org: {
                name: speed_test['autonomous_system_org_name'],
              }
            }
          }
        end
      end

      def speed_test_params
        params.require(:speed_test).permit(
          :latitude, :longitude, :tested_at, :address, :network_location, :network_type, :network_cost, :city,
          :state, :street, :house_number, :postal_code, :connection_data, :version_number, :build_number, :altitude,
          :accuracy, :address_provider, :background_mode, :alt_accuracy, :floor, :heading, :speed, :speed_accuracy, :session_id,
          :expected_download_speed, :expected_upload_speed, :client_first_name, :client_last_name, :client_email, :client_phone
        )
      end

      def mobile_speed_test_params
        params.require(:speed_test).permit(
          :tested_at, :address, :network_location, :network_type, :network_cost, :city, :state, :street,
          :house_number, :postal_code, :connection_data, :version_number, :build_number, :address_provider,
          :background_mode, :latitude, :latitude_before, :latitude_after, :longitude, :longitude_before,
          :longitude_after, :altitude, :altitude_before, :altitude_after, :accuracy, :accuracy_before, :accuracy_after,
          :alt_accuracy, :alt_accuracy_before, :alt_accuracy_after, :floor, :floor_before, :floor_after, :heading,
          :heading_before, :heading_after, :speed, :speed_before, :speed_after, :speed_accuracy, :speed_accuracy_before,
          :speed_accuracy_after, :session_id
        )
      end

      # Given lat, lng and zoom level, get XY tile combination
      def get_xy_from_coordinates_and_zoom(lat, lng, zoom)
        n = 2.0 ** zoom
        x_tile = ((lng + 180.0) / 360.0 * n).floor
        y_tile = ((1.0 - Math.log(Math.tan(lat * Math::PI / 180.0) + 1.0 / Math.cos(lat * Math::PI / 180.0)) / Math::PI) / 2.0 * n).floor
        [x_tile, y_tile]
      end

      # Invalidate Redis cache for all keys that have the XYZ
      # combination that holds the lonlat point within its bounds
      # to force a refresh considering there is a new test
      def invalidate_cache(speed_test)
        (MIN_ZOOM..MAX_ZOOM).each do |zoom|
          x_y = get_xy_from_coordinates_and_zoom(speed_test.latitude, speed_test.longitude, zoom)
          REDIS.del("mvt_#{zoom}_#{x_y[0]}_#{x_y[1]}")
          # I'm clearing some adjacent tiles just to make sure the area is covered
          # as sometimes the calculation gives a result which is right at the edge
          # of the tile, so it could be a miss. The zoom >= 6 is because at smaller
          # zoom levels, the tiles are so big that the chance of a miss is pretty low
          if zoom >= 6
            REDIS.del("mvt_#{zoom}_#{x_y[0] - 1}_#{x_y[1]}")
            REDIS.del("mvt_#{zoom}_#{x_y[0] + 1}_#{x_y[1]}")
            REDIS.del("mvt_#{zoom}_#{x_y[0]}_#{x_y[1] - 1}")
            REDIS.del("mvt_#{zoom}_#{x_y[0]}_#{x_y[1] + 1}")
            REDIS.del("mvt_#{zoom}_#{x_y[0] - 1}_#{x_y[1] - 1}")
            REDIS.del("mvt_#{zoom}_#{x_y[0] - 1}_#{x_y[1] + 1}")
            REDIS.del("mvt_#{zoom}_#{x_y[0] + 1}_#{x_y[1] - 1}")
            REDIS.del("mvt_#{zoom}_#{x_y[0] + 1}_#{x_y[1] + 1}")
          end
        end
      end
    end
  end
end
