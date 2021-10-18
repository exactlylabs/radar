class Client < ApplicationRecord
  belongs_to :user, optional: true
  has_many :measurements

  geocoded_by :address

  before_create :create_ids
  after_validation :geocode
  has_secure_password :secret, validations: false

  def claim_remote_port
    # TODO: This is not safe with concurrent clients
    range = ENV["REMOTE_PORT_RANGE"]
    start_port, end_port = range.split("-").map{|i| i.to_i}
    current_min = Client.minimum(:remote_gateway_port)
    
    if current_min == nil
      self.remote_gateway_port = start_port
    elsif current_min < end_port
      self.remote_gateway_port = current_min + 1
    else
      raise "No more available server ports"
    end
  end

  private

  def create_ids
    o = [('a'..'z'), (0..9)].map(&:to_a).flatten
    string = (0...11).map { o[rand(o.length)] }.join

    self.unix_user = "r#{string}"
  end
end
