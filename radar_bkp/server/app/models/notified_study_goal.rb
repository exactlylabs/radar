class NotifiedStudyGoal < ApplicationRecord
  belongs_to :geospace
  belongs_to :autonomous_system_org, optional: true
end