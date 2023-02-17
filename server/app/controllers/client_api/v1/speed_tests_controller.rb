module ClientApi
  module V1
    class SpeedTestsController < ApiController
      def create
        @speed_test = ClientSpeedTest.new speed_test_params
        @speed_test.connection_data = params[:connection_data]
        filename = "speed-test-#{params[:timestamp]}.json"
        json_content = params[:result].to_json
        @speed_test.result.attach(io: StringIO.new(json_content), filename: filename, content_type: "application/json")
        @speed_test.save
        # Call process to parse JSON and seed measurement
        ProcessSpeedTestJob.perform_later @speed_test
        head(:no_content)
      end

      def index
        @speed_tests = ClientSpeedTest.all
        render json: @speed_tests
      end


      ## New method to prevent issues migrating
      # mainly in the released app.
      # By retrieving NE and SW points of the map
      # we can respond with tests inside that bounding box
      def tests_with_bounds
        sw_lat = params[:sw_lat]
        sw_lng = params[:sw_lng]
        ne_lat = params[:ne_lat]
        ne_lng = params[:ne_lng]
        error = !sw_lat || !sw_lng || !ne_lat || !ne_lng
        @speed_tests = ClientSpeedTest.all.where('latitude >= ? and latitude <= ? and longitude >= ? and longitude <= ?', sw_lat.to_f, ne_lat.to_f, sw_lng.to_f, ne_lng.to_f) if !error
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
        params.require(:speed_test).permit(:latitude, :longitude, :tested_at, :address, :network_location, :network_type, :network_cost, :city, :state, :street, :house_number, :postal_code, :connection_data, :version_number, :build_number)
      end
    end
  end
end