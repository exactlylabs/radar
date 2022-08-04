class Account < ApplicationRecord
  has_secure_token :token
  has_many :users_accounts
  has_many :users, through: :users_accounts
  has_many :invites
  has_many :clients
  has_many :locations
  has_many :measurements

  enum account_type: [ :personal, :organization ]

  scope :not_deleted, -> { where(deleted_at: nil) }

end