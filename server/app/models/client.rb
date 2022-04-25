class Client < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :location, optional: true
  belongs_to :client_version, optional: true
  belongs_to :update_group, optional: true
  
  has_many :measurements

  geocoded_by :address

  before_create :create_ids
  after_validation :geocode
  has_secure_password :secret, validations: false

  def latest_download
    latest_measurement ? latest_measurement.download : nil
  end

  def latest_upload
    latest_measurement ? latest_measurement.upload : nil
  end

  def claim_remote_port
    # TODO: This is not safe with concurrent clients
    range = ENV["REMOTE_PORT_RANGE"]
    start_port, end_port = range.split("-").map{|i| i.to_i}
    current_max = Client.maximum(:remote_gateway_port)
    
    if current_max == nil
      self.remote_gateway_port = start_port
    elsif current_max < end_port
      self.remote_gateway_port = current_max + 1
    else
      raise "No more available server ports"
    end
  end

  def online?
    self.pinged_at && self.pinged_at > 1.minute.ago
  end

  def status
    if self.online?
      if test_requested
        "Test running"
      else
        "Active"
      end
    else
      "Offline"
    end
  end

  def status_style
    if self.online?
      if test_requested
        "badge-light-primary"
      else
        "badge-light-success"
      end
    else
      "badge-light-danger"
    end
  end

  private

  def create_ids
    o = [('a'..'z'), (0..9)].map(&:to_a).flatten - [0, "i", "o", "l"]
    string = (0...11).map { o[rand(o.length)] }.join

    self.unix_user = "r#{string}"
  end

  def latest_measurement
    self.measurements.order(created_at: :desc).first
  end
end
