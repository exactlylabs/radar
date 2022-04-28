class Location < ApplicationRecord
  validates :name, :address, presence: true

  belongs_to :user
  has_many :measurements
  has_many :clients

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
end
