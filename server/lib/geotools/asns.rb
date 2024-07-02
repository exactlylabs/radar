require 'csv'
require 'ipaddr'

module GeoTools
  def self.get_county_as_orgs(fips)
    base_url = ENV["BROADBANDMAPPING_API_URL"] || "https://api.mapping.exactlylabs.com"
    results = []
    next_url = "#{base_url}/api/v1/namespaces/counties/geospaces/#{fips}/asns?limit=1000"
    while next_url
      response = HTTP.get(next_url)
      if response.code != 200
        raise "Status #{response.code} getting ASNs for county #{fips}: #{response.body}"
      end
      res = response.parse
      res["results"].each do |as_org|
        # The API returns only the name, and that's sufficient for our purposes
        results << GeoTools::ASOrg.new(as_org["organization"], nil, nil, nil)
      end
      next_url = res["_links"]["next"]
    end
    return results
  end

  class ASOrg
    attr_accessor :name, :id, :country, :source

    def initialize(name, id, country, source)
      @name = name
      @id = id
      @country
      @source
    end
  end
end
