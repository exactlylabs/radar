module ClientApi
  module V1
    class SpeedTestsController < ApiController
      def create
        is_mobile = params[:mobile].present? && params[:mobile] == 'true'
        if is_mobile
          @speed_test = ClientSpeedTest.new mobile_speed_test_params
        else
          @speed_test = ClientSpeedTest.new speed_test_params
        end
        @speed_test.ip = request.remote_ip
        @speed_test.lonlat = "POINT(#{params[:speed_test][:longitude]} #{params[:speed_test][:latitude]})"
        @speed_test.connection_data = params[:connection_data]
        @speed_test.tested_by = params[:client_id]
        filename = "speed-test-#{params[:timestamp]}.json"
        json_content = params[:result].to_json
        @speed_test.result.attach(io: StringIO.new(json_content), filename: filename, content_type: 'application/json')
        @speed_test.save!
        # Call process to parse JSON and seed measurement
        ProcessSpeedTestJob.perform_later(@speed_test, is_mobile)
        head(:no_content)
      end

      def index
        @speed_tests = ClientSpeedTest.all.where('tested_by = ?', @widget_client.id)
        render json: @speed_tests
      end

      ## New method to prevent issues migrating
      # mainly in the released app.
      # By retrieving NE and SW points of the map
      # we can respond with tests inside that bounding box
      def tests_with_bounds
        is_global = params[:global]
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
          sql += " ORDER BY tested_at DESC LIMIT 500 "
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
          :accuracy, :address_provider, :background_mode, :alt_accuracy, :floor, :heading, :speed, :speed_accuracy, :session_id
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
