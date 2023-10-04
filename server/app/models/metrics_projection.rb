class MetricsProjection < ApplicationRecord
  belongs_to :study_level_aggregate, foreign_key: :study_aggregate_id
  belongs_to :autonomous_system_org, foreign_key: :autonomous_system_org_id, optional: true

end
