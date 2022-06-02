require "#{Rails.root}/lib/fips/fips_geocoder.rb"

class Location < ApplicationRecord
  validates :name, :address, presence: true

  belongs_to :user
  has_many :measurements, dependent: :nullify
  has_many :clients, dependent: :nullify

  scope :where_has_client_associated, -> { joins(:clients).where("clients.location_id IS NOT NULL") }

  geocoded_by :address do |obj, results|
    if geo = results.first
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
    results = Geocoder.search(self.address)
    if geo = results.first
      self.state_fips, self.county_fips = FipsGeocoderCli::get_fips_codes geo.latitude, geo.longitude
      self.latitude = geo.latitude
      self.longitude = geo.longitude
      self.state = geo.state
      self.county = geo.county
    end
  end

end
