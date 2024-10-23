class MobileUserDevice < ApplicationRecord
  has_secure_token

  belongs_to :user
  has_many :email_verification_codes  
end