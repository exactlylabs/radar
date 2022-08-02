class Invite < ApplicationRecord
  belongs_to :account
  has_secure_password :token, validations: false

  def status_to_human
    "Pending"
  end

  def get_badge_style
    "badge-light-warning"
  end
end