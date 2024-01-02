class ProcessSpeedTestJob < ApplicationJob
  queue_as :default

  def perform(measurement, is_mobile = false)
    FindAsnByIp.perform_now measurement
    return unless measurement.result.attached?

    json = JSON.parse(measurement.result.download)
    json['raw'].each do |result_measurement|
      if result_measurement['LastServerMeasurement'].present? || result_measurement['LastClientMeasurement'].present?
        if result_measurement['type'] == 'download'
          measurement.download_avg = if is_mobile
                                       get_avg_speed(result_measurement, true)
                                     else
                                       result_measurement['LastClientMeasurement']['MeanClientMbps']
                                     end
          measurement.download_id = get_id(result_measurement)
          measurement.loss = get_loss(result_measurement)
          measurement.latency = get_latency(result_measurement)
        else
          measurement.upload_avg = if is_mobile
                                     get_avg_speed(result_measurement, false)
                                   else
                                     result_measurement['LastClientMeasurement']['MeanClientMbps']
                                   end
          measurement.upload_id = get_id(result_measurement)
        end
      end
    end
    measurement.processed_at = Time.now
    measurement.save!
  end

  def get_id(result)
    result['LastServerMeasurement']&.fetch('ConnectionInfo', nil)&.fetch('UUID', nil)
  end

  def get_loss(result)
    tcp_info = result['LastServerMeasurement']&.fetch('TCPInfo', nil)
    return if tcp_info.nil?

    bytes_retrans = tcp_info.fetch('BytesRetrans', 0)
    bytes_sent = tcp_info.fetch('BytesSent', 0)
    (bytes_retrans / (bytes_sent * 100.0)).round(2) if bytes_sent.positive?
  end

  def get_latency(result)
    tcp_info = result['LastServerMeasurement']&.fetch('TCPInfo', nil)
    return if tcp_info.nil?

    min_rtt = tcp_info.fetch('MinRTT', nil)
    min_rtt / 1000.0 unless min_rtt.nil?
  end

  def get_avg_speed(result, is_download)
    bytes = is_download ? 'BytesSent' : 'BytesReceived'
    tcp_info = result['LastServerMeasurement']&.fetch('TCPInfo', nil)
    return if tcp_info.nil?

    num_bytes = tcp_info.fetch(bytes, nil)

    bbr_info = result['LastServerMeasurement']&.fetch('BBRInfo', nil)
    return if bbr_info.nil?

    elapsed_time = bbr_info.fetch('ElapsedTime', nil)

    (num_bytes * 8.0) / elapsed_time
  end
end
