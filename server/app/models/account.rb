class Account < ApplicationRecord
  has_many :user
  has_many :invite

  enum type: [ :personal, :organization ]

end