class UsersAccount < ApplicationRecord
  belongs_to :user
  belongs_to :account

  enum role: { owner: 0, collaborator: 1, guest: 2 }

  scope :is_user_allowed, ->(account_id, user_id) { where(account_id: account_id, user_id: user_id).count == 1 }
  scope :not_deleted, -> { where({ deleted_at: nil }) }

  def get_badge_style
    "badge-light-success"
  end

  def status_to_human
    "Active"
  end

  def is_shared?
    false
  end

  def is_all_accounts?
    false
  end

  def is_owner?
    self.role == UsersAccount.roles[:owner]
  end

  def is_collaborator?
    self.role == UsersAccount.roles[:collaborator]
  end

  def is_guest?
    self.role == UsersAccount.roles[:guest]
  end
end