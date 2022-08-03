class Client < ApplicationRecord
  belongs_to :user, optional: true, foreign_key: 'claimed_by_id'
  belongs_to :location, optional: true
  belongs_to :client_version, optional: true
  belongs_to :update_group, optional: true
  belongs_to :account, optional: true
  belongs_to :watchdog_version, optional: true
  
  has_many :measurements

  geocoded_by :address

  before_create :create_ids
  after_validation :geocode
  has_secure_password :secret, validations: false

  scope :where_online, -> { where("pinged_at > ?", 1.minute.ago)}
  scope :where_offline, -> { where("pinged_at <= ? OR pinged_at IS NULL", 1.minute.ago) }
  scope :where_no_location, -> { where("location_id IS NULL") }

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

  def test_requested?
    self.test_requested || self.location&.test_requested
  end

  def status
    if self.online?
      if test_requested?
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
      if test_requested?
        "badge-light-primary"
      else
        "badge-light-success"
      end
    else
      "badge-light-danger"
    end
  end

  def to_update_version
    if self.raw_version != "Dev" &&
      !self.update_group.nil?
      self.update_group.client_version
    end
  end

  def to_update_watchdog_version
    if self.raw_watchdog_version != "Dev" &&
      !self.update_group.nil?
      self.update_group.watchdog_version
    end
  end

  def to_update_distribution
    update_version = self.to_update_version
    if !update_version.nil?
      update_version.distribution_by_name(self.distribution_name)
    end
  end
  
  def to_update_signed_binary
    dist = self.to_update_distribution
    if !dist.nil?
      dist.signed_binary
    end
  end

  def to_update_watchdog_signed_binary
    v = self.to_update_watchdog_version
    if v
      v.signed_binary
    end
  end

  def to_update_binary
    dist = self.to_update_distribution
    if !dist.nil?
      dist.binary
    end
  end

  def to_update_watchdog_binary
    v = self.to_update_watchdog_version
    if v
      v.binary
    end
  end

  def has_update?
    dist = self.to_update_distribution
    !dist.nil? && dist.client_version.version != self.raw_version
  end

  def has_watchdog_update?
    v = self.to_update_watchdog_version
    !v.nil? && v.version != self.raw_watchdog_version
  end

  def latest_measurement
    self.measurements.order(created_at: :desc).first
  end

  def self.to_csv_enumerator
    @enumerator = Enumerator.new do |yielder|
      yielder << CSV.generate_line(%w{id client_id user_id location_id name address latitude longitude pinged_at created_at})
      includes(:location, :user).find_each do |client|
        yielder << CSV.generate_line([
          client.id,
          client.unix_user,
          client.user ? client.user.id : "",
          client.location ? client.location.id : "",
          client.name,
          client.address,
          client.latitude,
          client.longitude,
          client.pinged_at ? client.pinged_at.strftime("%m/%d/%Y %H:%M:%S") : "",
          client.created_at.strftime("%m/%d/%Y %H:%M:%S")
        ])
      end
    end
  end

  def self.to_csv_file
    tmp_file = Tempfile.new("clients.csv")
    File.open(tmp_file.path, 'w') do |file|
      to_csv_enumerator.each do |line|
        file.write(line)
      end
    end
    tmp_file
  end

  private

  def create_ids
    o = [('a'..'z'), (0..9)].map(&:to_a).flatten - [0, 1, "o", "l"]
    string = (0...11).map { o[rand(o.length)] }.join
    self.unix_user = "r#{string}"
  end

end
