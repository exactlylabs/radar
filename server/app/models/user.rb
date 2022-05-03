class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :lockable
  has_secure_token :token
  validates :first_name, :last_name, presence: true
  validates_acceptance_of :terms

  has_many :clients
  has_many :locations
  has_many :measurements
end
