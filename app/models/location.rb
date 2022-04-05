class Location < ApplicationRecord
  validates :name, :address, presence: true

  belongs_to :user
  has_many :measurements
  has_many :clients

  geocoded_by :address
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
