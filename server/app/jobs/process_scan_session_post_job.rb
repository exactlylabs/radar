class ProcessScanSessionPostJob < ApplicationJob
  queue_as :mobile_scans
  self.log_arguments = false

  def process(obj)

  end
end