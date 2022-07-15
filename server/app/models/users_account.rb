class UsersAccount < ApplicationRecord
  belongs_to :user
  belongs_to :account

  scope :is_user_allowed, ->(account_id, user_id) { where(account_id: account_id, user_id: user_id).count == 1 }
end