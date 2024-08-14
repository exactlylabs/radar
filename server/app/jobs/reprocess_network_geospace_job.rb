class ReprocessNetworkGeospaceJob < ApplicationJob
  queue_as :default
  sidekiq_options retry: 5

  def perform(network)
    Location.transaction do
      network.geospaces.excluding_lonlat(network.lonlat).each do |geospace|
        network.geospaces.delete geospace
      end
      Geospace.containing_lonlat(network.lonlat).each do |geospace|
        network.geospaces << geospace unless network.geospaces.include? geospace
      end

      state = network.state_geospace
      county = network.county_geospace
      if state.present?
        network.state = state.name
        network.state_fips = state.geoid
      end

      if county.present?
        network.county = county.name
        network.county_fips = county.geoid
      end
    end
  end
end
