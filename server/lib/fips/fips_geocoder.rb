module FipsGeocoderCli
  @base_url = "http://127.0.0.1:5000"

  def self.base_url=(url)
    @base_url = url
  end

  def self.get_fips_codes(lat, long)
    uri = URI("#{@base_url}/api/v1/fips")
    params = {"latitude": lat, "longitude": long}
    uri.query = URI.encode_www_form(params)
    begin
      res = Net::HTTP.get_response(uri)
    rescue
      return nil, nil
    end
    if res.is_a?(Net::HTTPSuccess)
      data = JSON.parse(res.body)
      state_fips = data["state_fips"] != "" ? data["state_fips"] : nil
      county_fips = data["county_fips"] != "" ? data["county_fips"] : nil
      return state_fips, county_fips
    end
    return nil, nil
  end
end