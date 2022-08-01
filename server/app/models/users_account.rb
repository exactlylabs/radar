class UsersAccount < ApplicationRecord
  belongs_to :user
  belongs_to :account

  scope :is_user_allowed, ->(account_id, user_id) { where(account_id: account_id, user_id: user_id).count == 1 }
  scope :not_deleted, -> { where({ deleted_at: nil }) }

  def get_badge_style
    "badge-light-success"
  end

  def status_to_human
    "Active"
  end

  def get_first_name
    user.first_name
  end

  def get_last_name
    user.last_name
  end

  def get_email
    user.email
  end

  def get_invited_at
    invited_at
  end

  def get_joined_at
    joined_at
  end
end