class ProcessSpeedTestJob < ApplicationJob
  queue_as :default

  def perform(measurement)
    FindAsnByIp.perform_now measurement
    if measurement.result.attached?
      json = JSON.parse(measurement.result.download)
      json["raw"].each do |result_measurement|
        if result_measurement["LastClientMeasurement"].present? && result_measurement["type"] == 'download'
          measurement.download_avg = result_measurement["LastClientMeasurement"]["MeanClientMbps"]
          measurement.ip = result_measurement["LastServerMeasurement"]["ConnectionInfo"]["Client"].split(':')[0] # only extract ip
          measurement.download_id = result_measurement["LastServerMeasurement"]["ConnectionInfo"]["UUID"]
          measurement.loss = result_measurement["LastServerMeasurement"]["TCPInfo"]["BytesRetrans"] / result_measurement["LastServerMeasurement"]["TCPInfo"]["BytesSent"] * 100
          measurement.latency = result_measurement["LastServerMeasurement"]["TCPInfo"]["MinRTT"] / 1000
        elsif result_measurement["LastClientMeasurement"].present? && result_measurement["type"] == 'upload'
          measurement.upload_avg = result_measurement["LastClientMeasurement"]["MeanClientMbps"]
          measurement.upload_id = result_measurement["LastServerMeasurement"]["ConnectionInfo"]["UUID"]
        end
      end
      measurement.processed_at = Time.now
      measurement.save
    end
  end
end