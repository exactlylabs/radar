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
  has_many :shared_accounts, through: :shared_users_accounts, source: :account

  enum account_type: [ :personal, :organization ]

  scope :not_deleted, -> { where(deleted_at: nil) }
  scope :shared_to_accounts, -> (id) { joins(:shared_users_account).where(original_account_id: id) }

  def is_organization?
    self.account_type == "organization"
  end

  def is_personal?
    self.account_type == "personal"
  end

  def get_share_state_string(scoped_shared_users_accounts)
    amount = scoped_shared_users_accounts.count
    if amount == 0
      "#{self.name} is not shared with anyone else."
    elsif amount == 1
      other_acc = Account.find(scoped_shared_users_accounts[0].shared_to_account_id)
      "Everyone at #{other_acc.name} will be able to access #{self.name}."
    else
      "#{amount} accounts will be able to access #{self.name}."
    end
  end

  def is_all_accounts?
    return false
  end

end