class ClientSpeedTest < ApplicationRecord
  has_one_attached :result
  belongs_to :widget_client, foreign_key: 'tested_by'
  belongs_to :autonomous_system, optional: true

  def read_result
    if self.result.attached?
      content = self.result.download
      self.gzip? ? ActiveSupport::Gzip.decompress(content) : content
    end
  end
end
