require "#{Rails.root}/lib/fips/fips_geocoder.rb"

class Location < ApplicationRecord
  validates :name, :address, presence: true

  belongs_to :user
  has_many :measurements, dependent: :nullify
  has_many :clients, dependent: :nullify

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

  def download_avg
    self.measurements.average(:download).round(5) if self.measurements.length.positive?
  end

  def upload_avg
    self.measurements.average(:upload).round(5) if self.measurements.length.positive?
  end

  def download_diff
    avg = self.download_avg
    if avg.nil? || self.expected_mbps_down.nil?
      return nil
    end
    diff = avg - self.expected_mbps_down
    "#{diff > 0 ? '+' : ''}#{((diff / self.expected_mbps_up) * 100).round(2)}%"
  end

  def upload_diff
    avg = self.upload_avg
    if avg.nil? || self.expected_mbps_up.nil?
      return nil
    end
    diff = avg - self.expected_mbps_up
    "#{diff > 0 ? '+' : ''}#{((diff / self.expected_mbps_up) * 100).round(2)}%"
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
