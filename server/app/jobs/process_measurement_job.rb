class ProcessMeasurementJob < ApplicationJob
  queue_as :default

  def perform(measurement)
    case measurement.style
    when "NDT7"
      data = measurement.result.download.split("\n")
      extended_info = nil
      download_total_bytes = 0
      upload_total_bytes = 0

      data.reverse.each do |line|
        if line.include?("measurement") && line.include?("TCPInfo")
          last_download = JSON.parse(line)
          extended_info = last_download["Value"]["TCPInfo"]
        elsif line.include?("measurement") && line.include?("download") && line.include?("NumBytes") && measurement.download_total_bytes.nil?
          last_download = JSON.parse(line)
          measurement.download_total_bytes = last_download["Value"]["AppInfo"]["NumBytes"]
        elsif line.include?("measurement") && line.include?("upload") && line.include?("NumBytes") && measurement.upload_total_bytes.nil?
          last_upload = JSON.parse(line)
          measurement.upload_total_bytes = last_upload["Value"]["AppInfo"]["NumBytes"]
        end
      end

      result = JSON.parse(data[-1])

      measurement.download = result["Download"]["Value"]
      measurement.upload = result["Upload"]["Value"]
      measurement.latency = result["MinRTT"]["Value"]
      measurement.extended_info = extended_info
      
      measurement.processed = true
      measurement.processed_at = Time.now

      measurement.save
    when "OOKLA"
      result = JSON.parse(measurement.result.download)

      measurement.download = (result["download"]["bandwidth"] / (1000.0 * 1000.0)) * 8
      measurement.upload = (result["upload"]["bandwidth"] / (1000.0 * 1000.0)) * 8
      measurement.latency = result["ping"]["latency"]
      measurement.jitter = result["ping"]["jitter"]
      measurement.download_total_bytes = result["download"]["bytes"]
      measurement.upload_total_bytes = result["upload"]["bytes"]
      measurement.save
    end
  end
end
