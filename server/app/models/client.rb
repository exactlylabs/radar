class Client < ApplicationRecord
  include EventSourceable
  
  module Events
    CREATED = "CREATED"
    WENT_ONLINE = "WENT_ONLINE"
    WENT_OFFLINE = "WENT_OFFLINE"
    SERVICE_STARTED = "SERVICE_STARTED"
    LOCATION_CHANGED = "LOCATION_CHANGED"
    ACCOUNT_CHANGED = "ACCOUNT_CHANGED"
    IP_CHANGED = "IP_CHANGED"
    AS_CHANGED = "AUTONOMOUS_SYSTEM_CHANGED"
    IN_SERVICE = "IN_SERVICE"
    NOT_IN_SERVICE = "NOT_IN_SERVICE"
  end

  # Event Hooks
  notify_change :account_id, Client::Events::ACCOUNT_CHANGED
  notify_change :location_id, Client::Events::LOCATION_CHANGED
  notify_change :in_service, {true => Client::Events::IN_SERVICE, false => Client::Events::NOT_IN_SERVICE}
  notify_change :ip, Client::Events::IP_CHANGED
  notify_change :autonomous_system_id, Client::Events::AS_CHANGED
  notify_change :online, {true => Client::Events::WENT_ONLINE, false => Client::Events::WENT_OFFLINE}
  

  # TODO: New agents are 15 seconds, old were 30. Once all the legacy "script based" clients are gone, update this to 15
  PING_DURATION = 30
  REDIS_PING_SET_NAME = "pods_status"

  enum data_cap_periodicity: { daily: 0, weekly: 1, monthly: 2}
  enum scheduling_periodicity: { scheduler_hourly: 0, scheduler_daily: 1, scheduler_weekly: 2, scheduler_monthly: 3 }
  belongs_to :user, optional: true, foreign_key: 'claimed_by_id'
  belongs_to :location, optional: true
  belongs_to :client_version, optional: true
  belongs_to :update_group, optional: true
  belongs_to :account, optional: true
  belongs_to :watchdog_version, optional: true
  belongs_to :autonomous_system, optional: true

  has_many :measurements
  has_many :client_event_logs
  has_many :ndt7_diagnose_reports


  validates :scheduling_amount_per_period, numericality: { only_integer: true, greater_than: 0 }

  before_create :create_ids
  after_save :send_event
  after_save :check_ip_changed

  # Any client's which haven't pinged in PING_DURRATION * 1.5 and currently aren't marked offline
  scope :where_outdated_online, -> { where.not(id: REDIS.zrangebyscore(Client::REDIS_PING_SET_NAME, (PING_DURATION * 1.5).second.ago.to_i, Time.now.to_i))}
  scope :where_test_should_be_requested, -> { where("test_scheduled_at <= ? OR test_scheduled_at IS NULL AND test_requested = false AND in_service = true", Time.now) }
  scope :where_online, -> { where(online: true) }
  scope :where_offline, -> { where(online: false) }
  scope :where_no_location, -> { where("location_id IS NULL") }
  scope :where_live, -> { where("staging=false OR staging IS NULL") }
  scope :where_staging, -> { where(staging: true) }
  scope :where_in_service, -> { where(in_service: true)}
  scope :where_not_in_service, -> { where(in_service: false)}

  def secret=(unencrypted_secret)
    # Manually set secret, to use our custom cost on BCrypt hasher
    # https://github.com/rails/rails/blob/main/activemodel/lib/active_model/secure_password.rb#L146
    if unencrypted_secret.nil?
      @secret = nil
      self.secret_digest = nil
    else
      @secret = unencrypted_secret
      cost = BCrypt::Engine::MIN_COST
      self.secret_digest = BCrypt::Password.create(unencrypted_secret, cost: cost)
    end
  end

  def authenticate_secret(secret)
    # same as https://github.com/rails/rails/blob/main/activemodel/lib/active_model/secure_password.rb#L168
    if self.secret_digest && BCrypt::Password.new(self.secret_digest).is_password?(secret)
      if BCrypt::Password.new(self.secret_digest).cost != BCrypt::Engine::MIN_COST
        # Update the digested secret to use the new cost
        self.secret = secret
        self.save!
      end
      return self
    end
  end

  def check_ip_changed
    if saved_change_to_ip
      # Call a job to search for the new ASN
      FindAsnByIp.perform_later self
    end
  end

  def compute_ping!
    REDIS.zadd Client::REDIS_PING_SET_NAME, Time.now.to_i, self.id
  end

  def disconnected!
    if UpdateGroup.joins(:events).where(
      "events.timestamp > ? AND (events.name = ? OR events.name = ?)",
      5.minute.ago, UpdateGroup::Events::CLIENT_VERSION_CHANGED, UpdateGroup::Events::WATCHDOG_VERSION_CHANGED
    ).present?
      return
    end

    REDIS.zrem Client::REDIS_PING_SET_NAME, self.id
    self.online = false
    self.save!
  end

  def self.update_outdated_online!
    # Fix online status based on their registered pings
    client_ids = REDIS.zrangebyscore(
      Client::REDIS_PING_SET_NAME, 
      (Client::PING_DURATION * 1.5).second.ago.to_i, 
      Time.now.to_i
    )
    clients = Client.left_joins(:update_group => :events).where.not(
      "events.id IS NOT NULL AND events.timestamp > ? AND (events.name = ? OR events.name = ?)",
      5.minute.ago, UpdateGroup::Events::CLIENT_VERSION_CHANGED, UpdateGroup::Events::WATCHDOG_VERSION_CHANGED
    ).where.not(id: client_ids).distinct
    clients.update(online: false)

    Client.where(online: false, id: client_ids).update(online: true)
  end

  def send_event

    if saved_change_to_online || saved_change_to_test_requested
      PodStatusChannel.broadcast_to(CHANNELS[:clients_status], self)
    end

    if saved_change_to_test_requested && test_requested
      PodAgentChannel.broadcast_test_requested self
    end

    if saved_change_to_update_group_id
      PodAgentChannel.broadcast_client_update_group_changed self
      WatchdogChannel.broadcast_watchdog_update_group_changed self
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
    start_port, end_port = range.split("-").map { |i| i.to_i }
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

  def test_running?
    self.status == 'Test running'
  end

  def data_cap_next_period
    if self.data_cap_current_period.nil?
      return Time.current
    end

    next_period_date = Time.current
    if self.daily?
      next_period_date = self.data_cap_current_period.tomorrow.at_end_of_day.to_date

    elsif self.weekly?
      next_period_date = self.data_cap_current_period.next_week.at_end_of_week.to_date

    elsif self.monthly?
      # For monthly expiration, use -1 if you want the last day of the month
      # In case of a day that is higher that the current month's, we use the last day of that month
      next_period_date = self.data_cap_current_period.next_month
      day_of_month = self.data_cap_day_of_month
      
      # set the day according to the day of the month
      if day_of_month == -1 || next_period_date.end_of_month.day < day_of_month
        day_of_month = next_period_date.end_of_month.day
      end
      next_period_date = next_period_date.change(day: day_of_month).to_date

    elsif self.yearly?
      next_period_date = self.data_cap_current_period.next_year.at_beginning_of_year.to_date

    end

    if next_period_date < Time.now
      # Ensures cases where the data_cap_current_period is way behind, making the .next_x_period still behind today
      next_period_date = Time.now
    end
    return next_period_date
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
    self.reload(:lock => true)
  end

  def next_schedule_period_end
    t = nil
    case self.scheduling_periodicity
    when "scheduler_hourly"
      t = self.scheduling_period_end.nil? ? Time.now.at_end_of_hour : self.scheduling_period_end.advance(hours: 1).at_end_of_hour

    when "scheduler_daily"
      t = self.scheduling_period_end.nil? ? Time.now.at_end_of_day : self.scheduling_period_end.next_day.at_end_of_day

    when "scheduler_weekly"
      t = self.scheduling_period_end.nil? ? Time.now.at_end_of_week : self.scheduling_period_end.next_week.at_end_of_week

    when "scheduler_monthly"
      t = self.scheduling_period_end.nil? ? Time.now.at_end_of_month : self.scheduling_period_end.next_month.at_end_of_the_month

    end
    if t < Time.now
      self.scheduling_period_end = nil
      t = next_schedule_period_end
    end
    return t
  end

  def schedule_next_test!(force = false)
    base_timestamp = Time.now
    return if self.test_scheduled_at.present? && self.test_scheduled_at > base_timestamp && !force

    self.scheduling_tests_in_period += 1
    if self.scheduling_period_end.nil?
      # Set it for the first time
      self.scheduling_tests_in_period = 0
      self.scheduling_period_end = self.next_schedule_period_end
    end

    if self.scheduling_tests_in_period >= self.scheduling_amount_per_period
      # We finished the number of tests for this period, change it to the next one
      self.scheduling_tests_in_period = 0
      base_timestamp = self.scheduling_period_end if self.scheduling_period_end > base_timestamp
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
    summary = { month_sum: nil, month_avg: nil }
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
        "Online"
      end
    else
      "Offline"
    end
  end

  def status_without_running
    return self.online? ? "Online" : "Offline"
  end

  def status_suffix
    if self.online?
      if test_requested?
        "running"
      else
        "online"
      end
    else
      "offline"
    end
  end

  def status_suffix_without_running
    return self.online? ? "online" : "offline"
  end

  def status_style
    if self.online? && !self.test_running?
      "badge-light-success"
    elsif self.test_running?
      "badge-light-primary"
    else
      "badge-light-danger"
    end
  end

  def has_pending_test
    !self.test_running? && self.test_requested?
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
      self.update_group_id, self.distribution_name, self.raw_version || ''
    ).exists?
  end

  def has_watchdog_update?
    if self.raw_watchdog_version == "Dev"
      return false
    end
    # This query bellow is an attempt to avoid deserializing UpdateGroup and WatchdogVersion objects when not necessary
    return WatchdogVersion.joins(
      :update_groups
    ).where(
      "update_groups.id = ? AND watchdog_versions.version != ?",
      self.update_group_id, self.raw_watchdog_version || ''
    ).exists?
  end

  def latest_measurement
    # Extra condition for download/upload not being null just in case there is some bad state
    self.measurements.order(created_at: :desc).where("download IS NOT NULL AND upload IS NOT NULL").first
  end

  def get_measurement_data(total_bytes)
    data_string = ""
    data_string += "~#{(total_bytes / (1024 ** 2)).round(0)} MB per test (" if total_bytes > 0
    data_string += "#{(self.data_cap_current_period_usage / (1024 ** 2)).round(0)} MB this month"
    data_string += ")" if total_bytes > 0
    data_string
  end

  def get_periodicity_period
    case self.data_cap_periodicity
    when "daily"
      "day"
    when "weekly"
      "week"
    when "monthly"
      "month"
    when "yearly"
      "year"
    else
      ""
    end
  end

  def get_scheduling_periodicity_period
    case self.scheduling_periodicity
    when "scheduler_hourly"
      "per hour"
    when "scheduler_daily"
      "per day"
    when "scheduler_weekly"
      "per week"
    else
      "per month"
    end
  end

  def get_speed_averages(account_id)
    raw_query = "SELECT AVG(download_total_bytes) as download, AVG(upload_total_bytes) as upload FROM " +
      "(SELECT download_total_bytes, upload_total_bytes FROM measurements WHERE client_id = ? AND account_id = ? " +
      "AND download_total_bytes IS NOT NULL AND upload_total_bytes IS NOT NULL LIMIT 10) AS total_avg"
    query = ActiveRecord::Base.sanitize_sql([raw_query, self.id, account_id])
    averages = ActiveRecord::Base.connection.execute(query)[0]
    download_avg = averages["download"] || 0
    upload_avg = averages["upload"] || 0
    download_avg + upload_avg
  end

  # Quick method for preventing division by zero
  def get_safe_data_cap_max_usage
    if self.data_cap_max_usage == 0
      return 1
    end
    self.data_cap_max_usage
  end

  def get_data_cap_percentage_usage
    percentage = (self.data_cap_current_period_usage * 100 / self.get_safe_data_cap_max_usage).floor(0)
    if percentage > 100
      return 100
    end
    percentage
  end

  def get_scheduling_periodicity_string
    "Tests are set to run #{self.scheduling_amount_per_period} #{self.scheduling_amount_per_period == 1 ? "time" : "times"} #{self.get_scheduling_periodicity_period}."
  end

  def get_scheduling_periodicity_value
    Client.scheduling_periodicities[self.scheduling_periodicity]
  end

  def get_data_cap_periodicity_value
    Client.data_cap_periodicities[self.data_cap_periodicity]
  end

  def self.to_csv_enumerator
    @enumerator = Enumerator.new do |yielder|
      yielder << CSV.generate_line(%w{id client_id user_id location_id name address latitude longitude pinged_at(UTC+0) created_at(UTC+0)})
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

  def self.to_csv_file()
    tmp_file = Tempfile.new("clients.csv")
    File.open(tmp_file.path, 'w') do |file|
      to_csv_enumerator.each_with_index do |line, index|
        file.write(line)
      end
    end
    tmp_file
  end

  def is_eth?(interface)
    interface["name"].match(/eth\d+/)
  end

  def is_enps?(interface)
    interface["name"].match(/enp\d+s\d+/)
  end

  def is_en?(interface)
    interface["name"].match(/en\d+/)
  end

  def has_no_ethernet_interface?
    self.network_interfaces.filter { |i| i.present? && (is_eth?(i) || is_enps?(i) || is_en?(i)) }.size == 0
  end

  def get_default_interface
    self.network_interfaces.filter { |i| i.present? && i[:default_route] == true }
  end

  def get_mac_address
    return "Not Available" if self.network_interfaces.nil?
    default_interface = self.get_default_interface
    if default_interface.size == 0
      self.network_interfaces[0]["mac"] # Just defaulting to the first one if no actual default_interface present?
    elsif default_interface.size == 1
      default_interface[0]["mac"]  
    else
      possible_interface = self.network_interfaces.filter { |i| i.present? && is_eth?(i) }
      return possible_interface[0]["mac"] if possible_interface.size >= 1
      possible_interface = self.network_interfaces.filter { |i| i.present? && is_en?(i) }
      return possible_interface[0]["mac"] if possible_interface.size >= 1
      possible_interface = self.network_interfaces.filter { |i| i.present? && is_enps?(i) }
      possible_interface[0]["mac"] # if we get to this point, we don't need to check for the length of filter result because it must be enps type
    end
  end

  # We suggest the nearest 10K based rounding up.
  # E.g. client's current data usage is 5302 MB ==> we suggest 10K MB
  # E.g. client's current data usage is 13451 MB ==> we suggest 20K MB
  def get_suggested_data_cap
    current_data_cap = (self.data_cap_current_period_usage / (1024**2)).ceil(0)
    (current_data_cap / 10_000.0).ceil(0) * 10_000
  end

  def get_frequency_text
    day = self.data_cap_day_of_month
    case day
      when 1
        "Data usage will be reset on the first day of each month."
      when -1
        "Data usage will be reset on the last day of each month."
      else
        "Data usage will be reset every month on day #{day}."
    end
  end

  def in_service?
    self.in_service
  end

  def get_in_service_action_label
    "Mark as #{self.in_service? ? "not in servce" : "in service"}"
  end

  def get_status_timestamp
    evt = self.client_event_logs.where("name = 'WENT_ONLINE' OR name = 'WENT_OFFLINE'").order("id DESC").limit(1).pluck(:timestamp)
    if evt.length > 0
      if evt[0].nil?
        return "-"
      end
      "Since #{evt[0].strftime('%b %d, %Y')}"
    end
  end

  def request_test!
    self.update(test_requested: true)
  end

  private

  def create_ids
    o = [('a'..'z'), (0..9)].map(&:to_a).flatten - [0, 1, "o", "l"]
    string = (0...11).map { o[rand(o.length)] }.join
    self.unix_user = "r#{string}"
  end
end
