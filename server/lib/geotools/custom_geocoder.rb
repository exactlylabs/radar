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
    def self.search_ip(ip)
      case Geocoder.config[:lookup]
      when :geoapify
        base_url = "https://api.geoapify.com/v1/ipinfo?ip=#{ip}&apiKey=#{ENV['GEOAPIFY_KEY']}"
        response = HTTP.get(base_url)
        if response.code != 200
          Sentry.capture_message("Status #{response.code} getting IP info for #{ip}: #{response.body}")
          return []
        else
          json = JSON.parse(response.body)
          return [Geocoder::Result.new(json)]
        end
      when :nominatim
        Geocoder.search(ip)
      end
    end
  end
end