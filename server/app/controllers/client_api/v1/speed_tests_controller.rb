module ClientApi
  module V1
    class SpeedTestsController < ApiController
      def create
        if process_raw_data(params) # async process ?
          head(:no_content)
        else
          head(:unprocessable_entity)
        end
      end

      def index
        @measurements = ClientFacingAppMeasurement.all
        render json: @measurements
      end

      private

      def process_raw_data(params)
        @measurement = ClientFacingAppMeasurement.new
        params[:raw].each do |result|
          if result[:LastClientMeasurement].present? && result[:type] == 'download'
            @measurement.download_avg = result[:LastClientMeasurement][:MeanClientMbps]
            @measurement.ip = result[:LastServerMeasurement][:ConnectionInfo][:Client].split(':')[0] # only extract ip
            @measurement.download_id = result[:LastServerMeasurement][:ConnectionInfo][:UUID]
            @measurement.loss = result[:LastServerMeasurement][:TCPInfo][:BytesRetrans] / result[:LastServerMeasurement][:TCPInfo][:BytesSent] * 100
            @measurement.latency = result[:LastServerMeasurement][:TCPInfo][:MinRTT] / 1000
          elsif result[:LastClientMeasurement].present? && result[:type] == 'upload'
            @measurement.upload_avg = result[:LastClientMeasurement][:MeanClientMbps]
            @measurement.upload_id = result[:LastServerMeasurement][:ConnectionInfo][:UUID]
          end
        end
        @measurement.latitude = params[:location][0]
        @measurement.longitude = params[:location][1]
        @measurement.tested_at = params[:timestamp]
        @measurement.save
      end
    end
  end
end