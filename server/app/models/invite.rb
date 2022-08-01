class Invite < ApplicationRecord
  belongs_to :account
  has_secure_password :token, validations: false

  def status_to_human
    "Pending"
  end

  def get_badge_style
    "badge-light-warning"
  end

  def get_first_name
    first_name
  end

  def get_last_name
    last_name
  end

  def get_email
    email
  end

  def get_invited_at
    sent_at
  end

  def get_joined_at
    nil
  end
end