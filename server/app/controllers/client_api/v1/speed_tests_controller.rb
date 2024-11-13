module ClientApi
  module V1
    class SpeedTestsController < ApiController
      include VectorTiles

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

        invalidate_cache(Namespaces.SPEED_TESTS, @speed_test.latitude, @speed_test.longitude) if @speed_test.latitude && @speed_test.longitude
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

      ## VT tiles method now receives some extra parameters
      # for filters
      def tiles
        x = params[:x].to_i
        y = params[:y].to_i
        z = params[:z].to_i
        is_global = params[:global] || @widget_client.id == 1
        filters = get_vt_filters

        sql_params = {
            x: x,
            y: y,
            z: z,
            isp: filters[:isp],
            from: filters[:from],
            to: filters[:to],
            min_price: filters[:min_price],
            max_price: filters[:max_price],
            connection_type: filters[:connection_type]
          }

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
              "autonomous_system_orgs"."id" AS autonomous_system_org_id,
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
                WHEN download_avg IS NULL THEN -1
                ELSE 0
              END AS download_quality,
              CASE
                WHEN upload_avg > 20 THEN 2
                WHEN upload_avg > 3 THEN 1
                WHEN upload_avg IS NULL THEN -1
                ELSE 0
              END AS upload_quality
            FROM client_speed_tests
            LEFT JOIN "autonomous_systems" ON "autonomous_systems"."id" = "client_speed_tests"."autonomous_system_id"
            LEFT JOIN "autonomous_system_orgs" ON "autonomous_system_orgs"."id" = "autonomous_systems"."autonomous_system_org_id"
            WHERE lonlat && (SELECT geom FROM tile_bounds)
          }

          sql += apply_vt_filters(filters)

          sql += %{
            AND ST_Intersects(
              lonlat::geometry, -- Cast lonlat to geometry for spatial operations
              (SELECT geom FROM tile_bounds) -- Get the tile boundary for the current tile
            )
          }

          sql += " AND tested_by = #{@widget_client.id}" unless is_global

          sql += %{
            GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13
          ), }

          sql += apply_view_by_filters(filters)

          sql += %{
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
              autonomous_system_org_id,
              loss,
              latency,
              -- Pulling this here to reduce complexity on the client side, plus, the mapbox/maplibre
              -- has a very unique way of handling layer styles, where doing something like a min() or max()
              -- is either very complex to follow, but also not intuitive at all. So we just give the client
              -- the correct representation for the dot's color.
              LEAST(download_quality, upload_quality) AS connection_quality
            FROM view_by_filtered_tests
            GROUP BY 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16
          ) AS tile_data;
          }
        sql = ApplicationRecord.sanitize_sql([sql, sql_params])
        @tiles = get_vector_tile(Namespaces::SPEED_TESTS, sql)

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

      def max_cost
        render json: { max_cost: ClientSpeedTest.where("network_cost != 'Nan' AND network_cost IS NOT NULL").maximum(:network_cost) }
      end

      private

      def apply_vt_filters(filters)
        sql = ''
        sql += ' AND "autonomous_system_orgs"."id" = :isp' unless filters[:isp].nil?
        sql += ' AND "client_speed_tests"."tested_at" >= to_timestamp(:from)' unless filters[:from].nil?
        sql += ' AND "client_speed_tests"."tested_at" <= to_timestamp(:to)' unless filters[:to].nil?
        sql += ' AND "client_speed_tests"."network_type" ILIKE ANY(:connection_type)' unless filters[:connection_type].empty?
        if filters[:include_no_cost]
          sql += ' AND ("client_speed_tests"."network_cost" = 0 OR "client_speed_tests"."network_cost" IS NULL OR ("client_speed_tests"."network_cost" >= :min_price AND "client_speed_tests"."network_cost" <= :max_price))'
        else
          sql += ' AND ("client_speed_tests"."network_cost" != 0 AND "client_speed_tests"."network_cost" IS NOT NULL AND ("client_speed_tests"."network_cost" >= :min_price AND "client_speed_tests"."network_cost" <= :max_price))'
        end
        sql += " AND network_cost != 'NaN' " # Filter out NaN values that may have slipped
        sql
      end

      def apply_view_by_filters(filters)
        sql = ' view_by_filtered_tests AS (SELECT * FROM filtered_tests WHERE '
        sql += '1 = 1)' if filters[:view_by_filters].nil?
        view_by = filters[:view_by]
        filtering_key = view_by == 'download' ? 'download_quality' :
                        view_by == 'upload' ? 'upload_quality' :
                        'connection_quality'
        if filtering_key != 'connection_quality'
          filters[:view_by_filters].each_with_index do |value, index|
            sql += ' OR ' if index > 0
            sql += "#{filtering_key} = #{value}"
          end
        else
          filters[:view_by_filters].each_with_index do |value, index|
            sql += ' OR ' if index > 0
            lower_between_download_and_upload = 'LEAST(download_quality, upload_quality)'
            sql += "#{lower_between_download_and_upload} = #{value}"
          end
        end
        sql += ')'
      end

      # Get the filters for the vector tile query
      # Incoming query params:
      # - connection_type: Array of connection types to filter
      #   - ['cellular', 'wifi', 'wired']
      # - isp: Autonomous System Org Id || 'all_providers'
      # - from: Start date for the tests, numeric timestamp
      # - to: End date for the tests, numeric timestamp
      # - min_price: Minimum price for the connection given for the speed test
      # - max_price: Maximum price for the connection given for the speed test
      # - include_no_cost: Boolean to include tests with no cost
      # - view_by: View by filter {'classification' | 'download' | 'upload'}
      # - view_by_filters: Which filters to apply for the view_by filter. This determines the color of the dots to show.
      #   - classification: ['no-internet' | 'unserved' | 'underserved' | 'served']
      #   - download: ['no-internet' | 'low' | 'mid' | 'high']
      #   - upload: [ 'no-internet' | 'low' | 'mid' | 'high']
      def get_vt_filters
        valid_params = vector_tile_params
        filters = {}
        filters[:connection_type] = get_connection_type_string(valid_params[:connection_type])
        filters[:isp] = valid_params[:isp] == 'all_providers' ? nil : valid_params[:isp]
        filters[:from] = valid_params[:from].to_i / 1000
        filters[:to] = valid_params[:to].to_i / 1000
        filters[:min_price] = valid_params[:min_price].to_i
        filters[:max_price] = valid_params[:max_price].to_i
        filters[:include_no_cost] = valid_params[:include_no_cost] == 'true'
        filters[:view_by] = valid_params[:view_by]
        filters[:view_by_filters] = view_by_filters_to_values(valid_params[:view_by], valid_params[:view_by_filters])
        filters
      end

      # Convert the connection types to a string to filter in sql via ILIKE ANY
      def get_connection_type_string(connection_types)
        return '{wifi, cellular, wired}' if connection_types.nil? || connection_types.empty?
        str = '{'
        connection_types.each_with_index do |type, index|
          str += type
          str += ',' if index < connection_types.length - 1
        end
        str += '}'
      end

      # Convert the view_by_filters to the values to filter in sql and show on the map
      def view_by_filters_to_values(view_by, view_by_filters)
        values = []
        case view_by
        when 'classification'
          view_by_filters.map do |filter|
            if filter == 'no-internet'
              values.push(-1)
            elsif filter == 'unserved'
              values.push(0)
            elsif filter == 'underserved'
              values.push(1)
            elsif filter == 'served'
              values.push(2)
            end
          end
        when 'download'
          view_by_filters.map do |filter|
            if filter == 'no-internet'
              values.push(-1)
            elsif filter == 'low'
              values.push(0)
            elsif filter == 'mid'
              values.push(1)
            elsif filter == 'high'
              values.push(2)
            end
          end
        when 'upload'
          view_by_filters.map do |filter|
            if filter == 'no-internet'
              values.push(-1)
            elsif filter == 'low'
              values.push(0)
            elsif filter == 'mid'
              values.push(1)
            elsif filter == 'high'
              values.push(2)
            end
          end
        else
          raise 'Invalid view_by filter'
        end
        values
      end

      def vector_tile_params
        params.permit(:global, :z, :x, :y, :isp, :from, :to, :min_price, :max_price, :include_no_cost, :view_by, view_by_filters: [], connection_type: [])
      end

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
    end
  end
end
