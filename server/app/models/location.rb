require "#{Rails.root}/lib/fips/fips_geocoder.rb"

class Location < ApplicationRecord
  validates :name, :address, presence: true

  belongs_to :user
  has_many :measurements, dependent: :nullify
  has_many :clients, dependent: :nullify

  scope :where_has_client_associated, -> { joins(:clients).where("clients.location_id IS NOT NULL").distinct }

  after_validation :custom_geocode, if: :will_save_change_to_address?

  scope :where_online, -> { joins(:clients).where("clients.pinged_at > ?", 1.minute.ago) }
  scope :where_offline, -> { joins(:clients).where("clients.pinged_at <= ? OR clients.pinged_at IS NULL", 1.minute.ago) }

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
