require 'geocoder'

module GeoTools
  class CustomGeocoder

    def self.search(address)
      Geocoder.search(address)
    end

    # This method is used to search for the coordinates of an IP address
    # If the current geocoder config expects Geoapify to be used, then we need to
    # manually call the api to get the coordinates based on the user's IP because
    # the base Geocoder class is not using the correct endpoint
    #
    # The method returns a set of coordinates in an array [latitude, longitude]
    # Or nil if the coordinates could not be found or an exception was raised
    def self.search_ip(ip)
      case Geocoder.config[:lookup]
      when :geoapify
        base_url = "https://api.geoapify.com/v1/ipinfo?ip=#{ip}&apiKey=#{ENV['GEOAPIFY_KEY']}"
        response = HTTP.get(base_url)
        if response.code != 200
          coordinates = nil
        else
          begin
            json = JSON.parse(response.body)
            result = Geocoder::Result::Base.new(json)
            coordinates = [result.data['location']['latitude'], result.data['location']['longitude']]
          rescue Exception => e
            Sentry.capture_exception(e)
            coordinates = nil
          end
        end
      when :nominatim
        result = Geocoder.search(ip)
        if result.first
          coordinates = result.first.coordinates
        else
          coordinates = nil
        end
      end
      coordinates
    end
  end
end