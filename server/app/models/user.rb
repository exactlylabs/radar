class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :lockable
  has_secure_token :token
  validates :first_name, :last_name, presence: true
  validates_acceptance_of :terms

  has_one_attached :avatar do |attachable|
    attachable.variant :thumb, resize_to_limit: [50, 50]
  end

  has_many :clients
  has_many :locations
  has_many :measurements
  has_many :users_accounts
  has_many :accounts, through: :users_accounts

end
