class ProcessMeasurementJob < ApplicationJob
  queue_as :default

  def perform(measurement)
    case measurement.style
    when "NDT7"
      data = measurement.result.download.split("\n")
      data.reverse.each do |line|
        if line.include?("measurement") && line.include?("TCPInfo")
          last_download = JSON.parse(line)
          extended_info = last_download["Value"]["TCPInfo"]
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

      measurement.save
    end
  end
end
