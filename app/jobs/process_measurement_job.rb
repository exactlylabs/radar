class ProcessMeasurementJob < ApplicationJob
  queue_as :default

  def perform(measurement)
    case measurement.style
    when "NDT7"
      result = JSON.parse(measurement.result.download.split("\n")[-1])

      measurement.download = result["Download"]["Value"]
      measurement.upload = result["Upload"]["Value"]
      measurement.latency = result["MinRTT"]["Value"]
      
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
