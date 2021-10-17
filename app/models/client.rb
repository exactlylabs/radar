class Client < ApplicationRecord
  belongs_to :user, optional: true
  has_many :measurements

  geocoded_by :address

  before_create :create_ids
  after_validation :geocode
  has_secure_password :secret, validations: false

  private

  def create_ids
    o = [('a'..'z'), ('A'..'Z'), (0..9)].map(&:to_a).flatten
    string = (0...11).map { o[rand(o.length)] }.join

    self.unix_user = "r#{string}"
  end
end
