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

      private
      def speed_test_params
        params.require(:speed_test).permit(:latitude, :longitude, :tested_at, :address, :network_location, :network_type, :network_cost, :city, :state, :street, :house_number, :postal_code, :connection_data)
      end
    end
  end
end