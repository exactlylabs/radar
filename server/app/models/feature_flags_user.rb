class FeatureFlagsUser < ApplicationRecord
  belongs_to :user
  belongs_to :feature_flag
end