class MetricsProjectionJob < ProjectionJob
  def perform
    MetricsProjectionProcessor::Processor.new.process
  end
end
