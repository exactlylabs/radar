require "#{Rails.root}/lib/fips/fips_geocoder.rb"

class Location < ApplicationRecord
  validates :name, :address, presence: true

  belongs_to :user
  has_many :measurements, dependent: :nullify
  has_many :clients, dependent: :nullify

  after_validation :custom_geocode, if: :will_save_change_to_address?

  scope :where_online, -> { joins(:clients).group(:id).having("sum(case when clients.pinged_at > (now() - interval '1 minute') then 1 else 0 end) >= 1") }

  ## This just gets locations with at least 1 client associated
  ## and with the condition that none are online. This does not 
  ## include locations with 0 clients associated, when it should
  scope :where_offline, -> { joins(:clients).group(:id).having("sum(case when clients.pinged_at > (now() - interval '1 minute') then 1 else 0 end) = 0") }

  scope :where_no_clients, -> { where.not(id: Client.select(:location_id).where.not(location_id: nil)) }

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
