class ReprocessNetworkGeospaceJob < ApplicationJob
  queue_as :default
  sidekiq_options retry: 5

  def perform(network)
    network.geospaces.excluding_lonlat(network.lonlat).each do |geospace|
      network.geospaces.delete geospace
    end
    Geospace.containing_lonlat(network.lonlat).each do |geospace|
      network.geospaces << geospace unless network.geospaces.include? geospace
    end
  end
end
