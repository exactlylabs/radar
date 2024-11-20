class ClientSpeedTest < ApplicationRecord
  include VectorTileable

  has_one_attached :result
  belongs_to :widget_client, foreign_key: 'tested_by'
  belongs_to :autonomous_system, optional: true
  belongs_to :mobile_scan_session, optional: true
  belongs_to :mobile_user_device, optional: true

  before_create :fill_geo_fields

  scope :within_box, -> (x_0, y_0, x_1, y_1) {
    where("lonlat::geometry && ST_MakeEnvelope(?, ?, ?, ?, 4326)", x_0, y_0, x_1, y_1)
  }
  scope :from_user, -> (user) { joins(:mobile_user_device).where(mobile_user_device: {user_id: user.id})}

  def read_result
    if self.result.attached?
      content = self.result.download
      self.gzip? ? ActiveSupport::Gzip.decompress(content) : content
    end
  end

  private

  def fill_geo_fields
    return unless self.lonlat.present?

    results = Geocoder.search([self.lonlat.latitude, self.lonlat.longitude])
    self.latitude = self.lonlat.latitude
    self.longitude = self.lonlat.longitude
    if geo = results.first
      self.state = geo.state if self.state.nil?
      self.county = geo.county if self.county.nil?
      self.city = geo.city if self.city.nil?
    end
  end
end
