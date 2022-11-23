class Client < ApplicationRecord
  # TODO: New agents are 15 seconds, old were 30. Once all the legacy "script based" clients are gone, update this to 15
  PING_DURRATION = 30

  belongs_to :user, optional: true, foreign_key: 'claimed_by_id'
  belongs_to :location, optional: true
  belongs_to :client_version, optional: true
  belongs_to :update_group, optional: true
  belongs_to :account, optional: true
  belongs_to :watchdog_version, optional: true
  
  has_many :measurements
  has_many :client_online_logs

  geocoded_by :address

  before_create :create_ids
  after_validation :geocode
  after_save :update_online_log
  has_secure_password :secret, validations: false

  # Any client's which haven't pinged in PING_DURRATION * 1.5 and currently aren't marked offline
  scope :where_outdated_online, -> { where("online = true AND (pinged_at < ? OR pinged_at IS NULL)", (PING_DURRATION * 1.5).second.ago) }

  scope :where_online, -> { where(online: true) }
  scope :where_offline, -> { where(online: false) }
  scope :where_no_location, -> { where("location_id IS NULL") }

  def self.update_outdated_online!
    Client.where_outdated_online.each do |c|
      c.online = false
      c.save!
    end
  end

  def update_online_log
    # Save an event to the prior account if the pod was removed from the account
    if saved_change_to_account_id && self.online
      ClientOnlineLog.create(
        client: self,
        account_id: account_id_before_last_save,
        event_name: "WENT_OFFLINE"
      )
    end
    # If online status was updated or account was changed or client was just created
    if saved_change_to_online || saved_change_to_account_id || saved_change_to_created_at
      ClientOnlineLog.create(
        client: self,
        account: self.account,
        event_name: online ? "WENT_ONLINE" : "WENT_OFFLINE"
      )
    end
  end

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
    self.online
  end

  def test_requested?
    self.test_requested || self.location&.test_requested
  end

  def verify_test_scheduler!
    # Load Cron and set a default value in case it's empty
    if self.cron_string.nil?
      # Assign an hourly cron, with a random minute
      minute = rand(0..59)
      self.cron_string = "#{minute} * * * *"
    end
    cron = Fugit.parse_cron(self.cron_string)

    if self.next_schedule_at.nil?
      self.next_schedule_at = cron.next_time(self&.measurements&.last&.created_at || Time.current).to_t

    elsif self.next_schedule_at < Time.current
      # Request a test and increment the next_schedule_at
      self.test_requested = true
      self.next_schedule_at = cron.next_time(Time.current).to_t
    end
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
