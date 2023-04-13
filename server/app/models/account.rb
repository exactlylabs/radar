class Account < ApplicationRecord
  has_secure_token :token
  has_many :users_accounts
  has_many :users, through: :users_accounts
  has_many :invites
  has_many :clients
  has_many :locations
  has_many :measurements
  has_one :client_count_aggregate, :as => :aggregator

  has_many :shared_users_accounts, foreign_key: :shared_to_account_id
  has_many :shared_users, through: :shared_users_accounts, source: :user

  enum account_type: [ :personal, :organization ]

  scope :shared_accounts, -> (account_id) { joins("INNER JOIN shared_users_accounts AS sua ON account.id = sua.original_account_id").where(account_id: account_id) }
  scope :not_deleted, -> { where(deleted_at: nil) }

  def is_organization?
    self.account_type == "organization"
  end

  def is_personal?
    self.account_type == "personal"
  end

end