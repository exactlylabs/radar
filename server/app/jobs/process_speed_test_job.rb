class ProcessSpeedTestJob < ApplicationJob
  queue_as :default

  def perform(measurement)
    FindAsnByIp.perform_now measurement
    return unless measurement.result.attached?

    json = JSON.parse(measurement.result.download)
    json['raw'].each do |result_measurement|
      if result_measurement['LastClientMeasurement'].present? && result_measurement['type'] == 'download'
        measurement.download_avg = result_measurement['LastClientMeasurement']['MeanClientMbps']
        measurement.download_id = get_id(result_measurement)
        measurement.loss = get_loss(result_measurement)
        measurement.latency = get_latency(result_measurement)
      elsif result_measurement['LastClientMeasurement'].present? && result_measurement['type'] == 'upload'
        measurement.upload_avg = result_measurement['LastClientMeasurement']['MeanClientMbps']
        measurement.upload_id = get_id(result_measurement)
      end
    end
    measurement.processed_at = Time.now
    measurement.save
  end

  def get_id(result)
    result['LastServerMeasurement']&.fetch('ConnectionInfo', nil)&.fetch('UUID', nil)
  end

  def get_loss(result)
    tcp_info = result['LastServerMeasurement']&.fetch('TCPInfo', nil)
    return if tcp_info.nil?

    bytes_retrans = tcp_info.fetch('BytesRetrans', 0)
    bytes_sent = tcp_info.fetch('BytesSent', 0)
    bytes_retrans / (bytes_sent * 100) if bytes_sent.positive?
  end

  def get_latency(result)
    tcp_info = result['LastServerMeasurement']&.fetch('TCPInfo', nil)
    return if tcp_info.nil?

    min_rtt = tcp_info.fetch('MinRTT', nil)
    min_rtt / 1000 unless min_rtt.nil?
  end
end
