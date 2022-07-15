class Account < ApplicationRecord
  has_many :users_accounts
  has_many :users, through: :user_accounts
  has_many :invites
  has_many :clients

  enum account_type: [ :personal, :organization ]

end