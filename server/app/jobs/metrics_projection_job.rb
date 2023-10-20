class MetricsProjectionJob < ProjectionJob
  def perform
    StudyMetricsProjectionProcessor::Processor.new.process
  end
end
