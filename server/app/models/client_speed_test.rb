class ClientSpeedTest < ApplicationRecord
  has_one_attached :result
  belongs_to :widget_client, foreign_key: 'tested_by'
  belongs_to :autonomous_system
end