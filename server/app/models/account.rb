class Account < ApplicationRecord
  has_many :user
  has_many :invite

  enum account_type: [ :personal, :organization ]

end