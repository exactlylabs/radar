module ClientApi
  module V1
    class SpeedTestsController < ApiController
      def create
        @speed_test = ClientSpeedTest.new
        @speed_test.latitude = params[:location][0]
        @speed_test.longitude = params[:location][1]
        @speed_test.tested_at = params[:timestamp]
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
    end
  end
end