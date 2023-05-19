require "#{Rails.root}/lib/fips/fips_geocoder.rb"


FipsGeocoderCli.base_url = ENV["FIPS_GEOCODER_URL"] ||= "http://127.0.0.1:5000"
