class PodsMetricsProjection < ApplicationRecord
  belongs_to :location, foreign_key: true
  belongs_to :account, foreign_key: true
  belongs_to :autonomous_system_org, foreign_key: true

end
