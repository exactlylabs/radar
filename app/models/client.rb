class Client < ApplicationRecord
  #include BCrypt

  belongs_to :user
  has_many :measurements

  geocoded_by :address
  

  before_create :create_ids
  after_validation :geocode
  has_secure_password :secret, validations: false

  def secret
    @secret ||= Password.new(secret_hash)
  end

  def secret=(new_secret)
    @secret = Password.create(new_secret)
    self.secret_hash = @secret
  end

  private

  def create_ids
    o = [('a'..'z'), ('A'..'Z')].map(&:to_a).flatten
    string = (0...11).map { o[rand(o.length)] }.join

    self.unix_user = "r#{string}"
  end
end
