require "#{Rails.root}/lib/fips/fips_geocoder.rb"
require "csv"

class Location < ApplicationRecord
  validates :name, :address, presence: true

  belongs_to :user, foreign_key: 'created_by_id'
  has_many :measurements, dependent: :nullify
  has_many :clients, dependent: :nullify

  after_validation :custom_geocode, if: :will_save_change_to_address?

  scope :where_online, -> { joins(:clients).group(:id).having("sum(case when clients.pinged_at > (now() - interval '1 minute') then 1 else 0 end) >= 1") }

  scope :where_offline, -> { left_joins(:clients).group(:id).having("sum(case when clients.pinged_at > (now() - interval '1 minute') then 1 else 0 end) = 0") }

  scope :where_has_client_associated, -> { joins(:clients).where("clients.location_id IS NOT NULL").distinct }

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

  def download_avg
    self.measurements.average(:download).round(3) if self.measurements.length.positive?
  end

  def upload_avg
    self.measurements.average(:upload).round(3) if self.measurements.length.positive?
  end

  def diff_to_human(diff, expected_value)
    sign = diff > 0 ? "+" : "" # Don't need the - for negative values as it will come in the actual calculation
    rounded_percentage = ((diff / expected_value) * 100).round(2)
    "#{sign}#{rounded_percentage}%"
  end

  def download_diff
    avg = self.download_avg
    if avg.nil? || self.expected_mbps_down.nil?
      return nil
    end
    diff = avg - self.expected_mbps_down
    diff_to_human(diff, self.expected_mbps_down)
  end

  def upload_diff
    avg = self.upload_avg
    if avg.nil? || self.expected_mbps_up.nil?
      return nil
    end
    diff = avg - self.expected_mbps_up
    diff_to_human(diff, self.expected_mbps_up)
  end

  def self.to_csv_enumerator
    @enumerator = Enumerator.new do |yielder|
      yielder << CSV.generate_line(%w{id name address latitude longitude user_id created_at expected_mbps_up expected_mbps_down state county manual_lat_long state_fips county_fips automatic_location})
      includes(:user).find_each do |location|
        yielder << CSV.generate_line([
          location.id,
          location.name,
          location.address,
          location.latitude,
          location.longitude,
          location.user ? location.user.id : "",
          location.created_at.strftime("%m/%d/%Y %H:%M:%S"),
          location.expected_mbps_up,
          location.expected_mbps_down,
          location.state,
          location.county,
          location.manual_lat_long,
          location.state_fips,
          location.county_fips,
          location.automatic_location
        ])
      end
    end
  end

  def self.to_csv_file
    tmp_file = Tempfile.new("locations.csv")
    File.open(tmp_file.path, 'w') do |file|
      to_csv_enumerator.each do |line|
        file.write(line)
      end
    end
    tmp_file
  end

  private

  def custom_geocode
    # if user manually set lat/long or clicked on the auto-locate
    # then we should use those values of lat/long for fips location
    # instead of the address (cause that value could have been overriden
    # with some other value on purpose)
    if !self.manual_lat_long && !self.automatic_location
      results = Geocoder.search(self.address)
    else
      results = Geocoder.search([self.latitude, self.longitude])
    end
    if geo = results.first
      self.state_fips, self.county_fips = FipsGeocoderCli::get_fips_codes geo.latitude, geo.longitude
      self.latitude = geo.latitude
      self.longitude = geo.longitude
      self.state = geo.state
      self.county = geo.county
    end
  end
end
