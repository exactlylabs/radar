class ProcessMeasurementJob < ApplicationJob
  queue_as :default

  def perform(measurement)
    FindAsnByIp.perform_now measurement
    case measurement.style
    when "NDT7"
      data = measurement.result.download.split("\n")
      extended_info = nil
      data.reverse.each do |line|
        begin
          row = JSON.parse(line)
        rescue JSON::ParserError
          next
        end
        if row["Key"] == "measurement" && row["Value"]["TCPInfo"] && extended_info.nil?
          extended_info = row["Value"]["TCPInfo"]
        end
        if row["Key"] == "measurement" && row["Value"]["Test"] == "download" && row["Value"]["TCPInfo"] && measurement.loss_rate.nil?
          measurement.loss_rate = (row["Value"]["TCPInfo"]["BytesRetrans"] / row["Value"]["TCPInfo"]["BytesSent"]) * 100.0
        end
        if row["Key"] == "measurement" && row["Value"]["Test"] == "upload" && row["Value"]["AppInfo"] && (measurement.upload_total_bytes.nil? || measurement.upload_total_bytes == 0)
          measurement.upload_total_bytes = row["Value"]["AppInfo"]["NumBytes"] * 1.1 # From tests, it seems that the real value is 5-10% of what the test returns
        elsif row["Key"] == "measurement" && row["Value"]["Test"] == "download" && row["Value"]["AppInfo"] && (measurement.download_total_bytes.blank? || measurement.download_total_bytes == 0)
          measurement.download_total_bytes = row["Value"]["AppInfo"]["NumBytes"] * 1.1 # From tests, it seems that the real value is 3-10% of what the test returns
        end
      end

      result = JSON.parse(data[-1])

      measurement.download = result["Download"]["Value"]
      measurement.upload = result["Upload"]["Value"]
      measurement.latency = result["MinRTT"]["Value"]
      measurement.extended_info = extended_info
      
    when "OOKLA"
      result = JSON.parse(measurement.result.download)

      measurement.download = (result["download"]["bandwidth"] / (1000.0 * 1000.0)) * 8
      measurement.upload = (result["upload"]["bandwidth"] / (1000.0 * 1000.0)) * 8
      measurement.latency = result["ping"]["latency"]
      measurement.jitter = result["ping"]["jitter"]
      measurement.download_total_bytes = result["download"]["bytes"] * 1.1 # From tests, it seems that the real value is 3-10% of what the test returns
      measurement.upload_total_bytes = result["upload"]["bytes"] * 1.1 # From tests, it seems that the real value is 5-10% of what the test returns
  
    end
    measurement.processed = true
    measurement.processed_at = measurement.processed_at ? measurement.processed_at : Time.now
    measurement.download_total_bytes = 0 if measurement.download_total_bytes.nil?
    measurement.upload_total_bytes = 0 if measurement.upload_total_bytes.nil?
    measurement.save
    measurement.client.add_bytes!(measurement.created_at, measurement.download_total_bytes + measurement.upload_total_bytes)
  
    if measurement.location.present?
      measurement.location.recalculate_averages!
    end
  end
end
