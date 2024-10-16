class ProcessNetworkStatusHistoryProjectorJob < ProjectionJob
  def perform
    NetworkStatusHistoryProjector.new.process!
  end
end