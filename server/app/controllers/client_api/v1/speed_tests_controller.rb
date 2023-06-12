module ClientApi
  module V1
    class SpeedTestsController < ApiController
      def create
        is_mobile = params[:mobile].present? && params[:mobile] == 'true'
        @speed_test = if is_mobile
                        ClientSpeedTest.new mobile_speed_test_params
                      else
                        ClientSpeedTest.new speed_test_params
                      end
        @speed_test.lonlat = "POINT(#{params[:speed_test][:longitude]} #{params[:speed_test][:latitude]})"
        @speed_test.connection_data = params[:connection_data]
        @speed_test.tested_by = params[:client_id]
        filename = "speed-test-#{params[:timestamp]}.json"
        json_content = params[:result].to_json
        @speed_test.result.attach(io: StringIO.new(json_content), filename: filename, content_type: 'application/json')
        @speed_test.save!
        # Call process to parse JSON and seed measurement
        ProcessSpeedTestJob.perform_later @speed_test
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
          @speed_tests = if is_global
                           ClientSpeedTest.all.where(
                             'latitude >= ? AND latitude <= ? AND longitude >= ? AND longitude <= ?',
                             sw_lat.to_f, ne_lat.to_f, sw_lng.to_f, ne_lng.to_f)
                         else
                           ClientSpeedTest.all.where(
                             'tested_by = ? AND latitude >= ? AND latitude <= ? AND longitude >= ? AND longitude <= ?',
                             @widget_client.id, sw_lat.to_f, ne_lat.to_f, sw_lng.to_f, ne_lng.to_f)
                         end
        end
        respond_to do |format|
          if error
            format.json { render json: { msg: 'Missing map bounds!' }, status: :bad_request }
          else
            format.json { render json: @speed_tests, status: :ok }
          end
        end
      end

      private

      def speed_test_params
        params.require(:speed_test).permit(
          :latitude, :longitude, :tested_at, :address, :network_location, :network_type, :network_cost, :city,
          :state, :street, :house_number, :postal_code, :connection_data, :version_number, :build_number, :altitude,
          :accuracy, :address_provider, :background_mode, :alt_accuracy, :floor, :heading, :speed, :speed_accuracy
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
          :speed_accuracy_after
        )
      end
    end
  end
end
