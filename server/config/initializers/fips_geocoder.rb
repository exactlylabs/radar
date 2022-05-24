require_relative "../../lib/fips/fips_geocoder.rb"


if ENV["FIPS_GEOCODER_URL"].present?
  FipsGeocoderCli.base_url = ENV["FIPS_GEOCODER_URL"]
elsif Rails.env.production?
  # TODO: Add production url once we have it
  FipsGeocoderCli.base_url = "http://127.0.0.1:5000"
end
