class ProcessOutages < ProjectionJob
  def perform
    OutagesProjector.process
  end
end
