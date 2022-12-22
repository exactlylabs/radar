class Client < ApplicationRecord
  # TODO: New agents are 15 seconds, old were 30. Once all the legacy "script based" clients are gone, update this to 15
  PING_DURATION = 30
  enum data_cap_periodicity: {daily: 0, weekly: 1, monthly: 2, yearly: 3}
  enum scheduling_periodicity: {scheduler_hourly: 0, scheduler_daily: 1, scheduler_weekly: 2, scheduler_monthly: 3}
  belongs_to :user, optional: true, foreign_key: 'claimed_by_id'
  belongs_to :location, optional: true
  belongs_to :client_version, optional: true
  belongs_to :update_group, optional: true
  belongs_to :account, optional: true
  belongs_to :watchdog_version, optional: true
  belongs_to :autonomous_system, optional: true
  
  has_many :measurements
  has_many :client_event_logs

  geocoded_by :address

  validates :scheduling_amount_per_period, numericality: { only_integer: true, greater_than: 0 }

  before_create :create_ids
  after_validation :geocode
  after_save :send_event
  after_create :send_created_event
  after_commit :check_ip_changed
  has_secure_password :secret, validations: false

  # Any client's which haven't pinged in PING_DURRATION * 1.5 and currently aren't marked offline
  scope :where_outdated_online, -> { where("online = true AND (pinged_at < ? OR pinged_at IS NULL)", (PING_DURATION * 1.5).second.ago) }
  scope :where_test_should_be_requested, -> { where("test_scheduled_at <= ? AND test_requested = false", Time.now)}
  scope :where_online, -> { where(online: true) }
  scope :where_offline, -> { where(online: false) }
  scope :where_no_location, -> { where("location_id IS NULL") }
  scope :where_live, -> { where("staging=false OR staging IS NULL") }
  scope :where_staging, -> { where(staging: true) }

  def check_ip_changed
    if saved_change_to_ip
        # Call a job to search for the new ASN
        FindAsnByIp.perform_later self
    end
  end

  def self.update_outdated_online!
    Client.where_outdated_online.each do |c|
      c.online = false
      c.save!
    end
  end

  def send_created_event
    ClientEventLog.created_event self, timestamp: self.created_at
  end

  def send_event
    if saved_change_to_account_id
      ClientEventLog.account_changed_event self, account_id_before_last_save, self.account_id
    end
    if saved_change_to_location_id
      ClientEventLog.location_changed_event self, location_id_before_last_save, self.location_id
    end
    if saved_change_to_online && online
      ClientEventLog.went_online_event self
    end
    if saved_change_to_online && !online
      ClientEventLog.went_offline_event self
    end
    if saved_change_to_ip
      ClientEventLog.ip_changed_event self, ip_before_last_save, self.ip
    end

    if saved_change_to_autonomous_system_id
      ClientEventLog.autonomous_system_changed_event self, autonomous_system_id_before_last_save, self.autonomous_system_id
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

  def data_cap_next_period
    if self.data_cap_current_period.nil?
      return Time.current
    end
    if self.daily?
      return self.data_cap_current_period.tomorrow.to_date
    elsif self.weekly?
      return self.data_cap_current_period.next_week.to_date
    elsif self.monthly?
      return self.data_cap_current_period.next_month.at_beginning_of_month.to_date
    elsif self.yearly?
      return self.data_cap_current_period.next_year.at_beginning_of_year.to_date
    end
  end

  def self.refresh_outdated_data_usage!
    # For each Client, reset their current period usage in case
    # the current period is no longer valid (moved to another one)
    Client.all.each do |c|
      if c.data_cap_next_period.before?(Time.current)
        c.data_cap_current_period = c.data_cap_next_period
        c.data_cap_current_period_usage = 0.0
        c.save!
      end
    end
  end

  def has_data_cap?
    return self.data_cap_max_usage.nil? || self.data_cap_periodicity.nil? || 
      self.data_cap_max_usage > self.data_cap_current_period_usage
  end

  def add_bytes!(period, byte_size)
    Client.transaction do
      c = Client.lock("FOR UPDATE").find(self.id)
      if c.data_cap_current_period && c.data_cap_next_period&.before?(period)
        c.data_cap_current_period = period
        c.data_cap_current_period_usage = 0.0
      end
      c.data_cap_current_period_usage += byte_size
      c.save!
    end
    self.reload(:lock=>true)
  end

  def next_schedule_period_end
    case self.scheduling_periodicity
    when "scheduler_hourly"
      self.scheduling_period_end.nil? ? Time.now.at_end_of_hour : self.scheduling_period_end.advance(hours: 1).at_end_of_hour

    when "scheduler_daily"
      self.scheduling_period_end.nil? ? Time.now.at_end_of_day : self.scheduling_period_end.next_day.at_end_of_day

    when "scheduler_weekly"
      self.scheduling_period_end.nil? ? Time.now.at_end_of_week : self.scheduling_period_end.next_week.at_end_of_week
    
    when "scheduler_monthly"
      self.scheduling_period_end.nil? ? Time.now.at_end_of_month : self.scheduling_period_end.next_month.at_end_of_the_month

    end
  end

  def schedule_next_test!(force=false)
    base_timestamp = Time.now
    return if self.test_scheduled_at.present? && self.test_scheduled_at > base_timestamp && !force
    
    if self.scheduling_period_end.nil?
      # Set it for the first time
      self.scheduling_period_end = self.next_schedule_period_end
    elsif self.scheduling_tests_in_period == self.scheduling_amount_per_period
      # We finished the number of tests for this period, change it to the next one
      self.scheduling_tests_in_period = 0
      base_timestamp = self.scheduling_period_end
      self.scheduling_period_end = self.next_schedule_period_end
    elsif self.scheduling_period_end < Time.now
      # It's time to set the next period
      self.scheduling_tests_in_period = 0
      self.scheduling_period_end = self.next_schedule_period_end
    end

    # If we were to split the N tests in equal parts, each test should be spaced by max_freq.
    # Since we want randomly spaced tests, we select the next test in a range between now and the max_freq.
    # In other words, select a time between the range (base_timestamp, base_timestamp + max_freq]
    max_freq = (self.scheduling_period_end - base_timestamp) / (self.scheduling_amount_per_period - self.scheduling_tests_in_period)
    
    self.test_scheduled_at = Time.at(base_timestamp + (max_freq * rand))
    self.save!
  end

  def self.request_scheduled_tests!
    Client.where_test_should_be_requested.each do |client|
      client.test_requested = true
      client.save!
    end
  end

  def data_usage_summary
    res = self.measurements.where(
      "created_at >= ?", Time.current.at_beginning_of_month
    ).pluck(Arel.sql('SUM(download_total_bytes)'), Arel.sql('AVG(download_total_bytes)'))
    summary = {month_sum: nil, month_avg: nil}
    if res
      summary[:month_sum] = res[0][0]
      summary[:month_avg] = res[0][1]
    end
    return summary
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
    # This query bellow is an attempt to avoid deserializing Distribution, UpdateGroup and ClientVersion objects when not necessary
    return Distribution.joins(
      client_version: :update_groups
    ).where(
      "update_groups.id = ? AND distributions.name = ? AND client_versions.version != ?", 
      self.update_group_id, self.distribution_name, self.raw_version
    ).exists?
  end

  def has_watchdog_update?
    # This query bellow is an attempt to avoid deserializing UpdateGroup and WatchdogVersion objects when not necessary
    return WatchdogVersion.joins(
      :update_groups
    ).where(
      "update_groups.id = ? AND watchdog_versions.version != ?", 
      self.update_group_id, self.raw_watchdog_version
    ).exists?
  end

  def latest_measurement
    self.measurements.order(created_at: :desc).first
  end

  def get_measurement_data
    data_string = ""
    total_bytes = 0
    self.measurements.each do |measurement|
      if measurement.download_total_bytes.present? && measurement.upload_total_bytes.present?
        total_bytes += ((measurement.download_total_bytes + measurement.upload_total_bytes) / 1_048_576).round(0)
      end
    end
    if total_bytes > 0
      data_string += "~#{(total_bytes / self.measurements.length).round(0)} MB per test ("
    end
    data_string += "#{(self.data_cap_current_period_usage / 1_048_576).round(0)} MB this month"
    data_string += ")" if total_bytes > 0
    data_string
  end

  def get_periodicity_period
    puts "PERIO => #{self.data_cap_periodicity}"
    "month" if self.data_cap_periodicity == 'monthly'
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
