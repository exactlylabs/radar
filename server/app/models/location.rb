class Location < ApplicationRecord
  validates :name, :address, presence: true

  belongs_to :user
  has_many :measurements, dependent: :nullify
  has_many :clients, dependent: :nullify
  
  geocoded_by :address do |obj, results|    
    if geo = results.first
      obj.state_fips, obj.county_fips = fips_codes geo.latitude, geo.longitude
      obj.latitude = geo.latitude
      obj.longitude = geo.longitude
      #obj.city = geo.city
      #obj.country = geo.country
      #obj.country_code = geo.country_code
      #obj.postal_code = geo.postal_code
      obj.state = geo.state
      obj.county = geo.county
      #obj.state_code = geo.state_code
      #obj.street_address = geo.street_address
    end
  end
  after_validation :geocode, if: :will_save_change_to_address?

  def latest_download
    latest_measurement ? latest_measurement.download : nil
  end

  def latest_upload
    latest_measurement ? latest_measurement.upload : nil
  end

  def latest_measurement
    self.measurements.order(created_at: :desc).first
  end

  def online?
    clients.where("pinged_at > ?", 1.minute.ago).any?
  end

  def self.fips_codes(lat, long)
    uri = URI("#{Rails.configuration.fips_geocoder_url}/api/v1/fips")
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
