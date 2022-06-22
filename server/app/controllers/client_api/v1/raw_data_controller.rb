module ClientApi
  module V1
    class RawDataController < ApiController
      after_action :set_cors_access_control_headers
      
      def raw
        if process_raw_data(params) # async process ?
          head(:no_content)
        else
          head(:unprocessable_entity)
        end
      end

      def get_raw
        @measurements = ClientFacingAppMeasurement.all
        render json: @measurements
      end

      private

      def process_raw_data(params)
        is_download = true
        @measurement = ClientFacingAppMeasurement.new
        params[:raw].each do |block|
          if block[:LastClientMeasurement].present? && is_download
            is_download = false
            @measurement.download_avg = block[:LastClientMeasurement][:MeanClientMbps]
            @measurement.ip = block[:LastServerMeasurement][:ConnectionInfo][:Client].split(':')[0] # only extract ip
            @measurement.download_id = block[:LastServerMeasurement][:ConnectionInfo][:UUID]
            @measurement.loss = block[:LastServerMeasurement][:TCPInfo][:BytesRetrans] / block[:LastServerMeasurement][:TCPInfo][:BytesSent] * 100
            @measurement.latency = block[:LastServerMeasurement][:TCPInfo][:MinRTT] / 1000
          elsif block[:LastClientMeasurement].present? && !is_download
            @measurement.upload_avg = block[:LastClientMeasurement][:MeanClientMbps]
            @measurement.upload_id = block[:LastServerMeasurement][:ConnectionInfo][:UUID]
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