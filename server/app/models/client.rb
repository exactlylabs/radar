class Client < ApplicationRecord
  include EventSourceable

  module Events
    CREATED = 'CREATED'
    WENT_ONLINE = 'WENT_ONLINE'
    WENT_OFFLINE = 'WENT_OFFLINE'
    SERVICE_STARTED = 'SERVICE_STARTED'
    LOCATION_CHANGED = 'LOCATION_CHANGED'
    ACCOUNT_CHANGED = 'ACCOUNT_CHANGED'
    IP_CHANGED = 'IP_CHANGED'
    AS_CHANGED = 'AUTONOMOUS_SYSTEM_CHANGED'
    IN_SERVICE = 'IN_SERVICE'
    NOT_IN_SERVICE = 'NOT_IN_SERVICE'
    CLIENT_REQUESTED_TO_UPDATE = 'CLIENT_REQUESTED_TO_UPDATE'
    WATCHDOG_REQUESTED_TO_UPDATE = 'WATCHDOG_REQUESTED_TO_UPDATE'
  end

  # Event Hooks
  notify_change :account_id, Client::Events::ACCOUNT_CHANGED
  notify_change :location_id, Client::Events::LOCATION_CHANGED
  notify_change :in_service, { true => Client::Events::IN_SERVICE, false => Client::Events::NOT_IN_SERVICE }
  notify_change :ip, Client::Events::IP_CHANGED
  notify_change :autonomous_system_id, Client::Events::AS_CHANGED
  notify_change :online, { true => Client::Events::WENT_ONLINE, false => Client::Events::WENT_OFFLINE }
  notify_change :target_client_version_id, Client::Events::CLIENT_REQUESTED_TO_UPDATE
  notify_change :target_watchdog_version_id, Client::Events::WATCHDOG_REQUESTED_TO_UPDATE

  # TODO: New agents are 15 seconds, old were 30. Once all the legacy "script based" clients are gone, update this to 15
  PING_DURATION = 30
  REDIS_PING_SET_NAME = 'pods_status'

  enum data_cap_periodicity: { daily: 0, weekly: 1, monthly: 2 }
  enum scheduling_periodicity: { scheduler_hourly: 0, scheduler_daily: 1, scheduler_weekly: 2, scheduler_monthly: 3 }
  belongs_to :user, optional: true, foreign_key: 'claimed_by_id'
  belongs_to :location, optional: true
  belongs_to :client_version, optional: true
  belongs_to :target_client_version, optional: true, class_name: 'ClientVersion'
  belongs_to :update_group, optional: true
  belongs_to :account, optional: true
  belongs_to :watchdog_version, optional: true
  belongs_to :target_watchdog_version, optional: true, class_name: 'WatchdogVersion'
  belongs_to :autonomous_system, optional: true

  has_many :measurements
  has_many :client_event_logs
  has_many :ndt7_diagnose_reports

  validates :scheduling_amount_per_period, numericality: { only_integer: true, greater_than: 0 }

  before_create :create_ids
  after_save :send_event
  after_save :check_ip_changed
  after_save :update_versions, if: :saved_change_to_update_group_id?

  # Any client's which haven't pinged in PING_DURRATION * 1.5 and currently aren't marked offline
  scope :where_outdated_online, lambda {
    where.not(id: REDIS.zrangebyscore(Client::REDIS_PING_SET_NAME, (PING_DURATION * 1.5).second.ago.to_i, Time.now.to_i))
  }
  scope :where_test_should_be_requested, lambda {
    where('(test_scheduled_at <= ? OR test_scheduled_at IS NULL) AND (test_requested = false AND in_service = true)', Time.now)
  }
  scope :where_online, -> { where(online: true) }
  scope :where_offline, -> { where(online: false) }
  scope :where_no_location, -> { where('location_id IS NULL') }
  scope :where_in_service, -> { where(in_service: true)}
  scope :where_not_in_service, -> { where(in_service: false)}
  scope :where_no_account, -> { where("account_id IS NULL") }

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
    return unless secret_digest && BCrypt::Password.new(secret_digest).is_password?(secret)

    if BCrypt::Password.new(secret_digest).cost != BCrypt::Engine::MIN_COST
      # Update the digested secret to use the new cost
      self.secret = secret
      save!
    end
    self
  end

  def check_ip_changed
    return unless saved_change_to_ip

    # Call a job to search for the new ASN
    FindAsnByIp.perform_later self
  end

  def compute_ping!
    REDIS.zadd Client::REDIS_PING_SET_NAME, Time.now.to_i, id
  end

  def disconnected!
    if events.where(
      'events.timestamp > ? AND (events.name = ? OR events.name = ?)',
      5.minute.ago, Client::Events::CLIENT_REQUESTED_TO_UPDATE, Client::Events::WATCHDOG_REQUESTED_TO_UPDATE
    ).present?
      return
    end

    REDIS.zrem Client::REDIS_PING_SET_NAME, id
    Client.transaction do
      c = Client.lock("FOR UPDATE").find(id)
      if c.online
        c.online = false
        c.save!
      end
    end
    self.reload
  end

  def connected!
    REDIS.zadd Client::REDIS_PING_SET_NAME, Time.now.to_i, id
    Client.transaction do
      c = Client.lock().find(id)
      if !c.online
        c.online = true
        c.save!
      end
    end
    self.reload
  end

  def self.update_outdated_online!
    # Fix online status based on their registered pings
    client_ids = REDIS.zrangebyscore(
      Client::REDIS_PING_SET_NAME,
      (Client::PING_DURATION * 1.5).second.ago.to_i,
      Time.now.to_i
    )
    clients = Client.left_joins(:events).where.not(
      'events.id IS NOT NULL AND events.timestamp > ? AND (events.name = ? OR events.name = ?)',
      5.minute.ago, Client::Events::CLIENT_REQUESTED_TO_UPDATE, Client::Events::WATCHDOG_REQUESTED_TO_UPDATE
    ).where.not(id: client_ids).distinct
    # Adding locks to avoid concurrency between this and disconnected!
    Client.transaction do
      Client.where(id: clients).lock().each do |c|
        if c.online
          c.online = false
          c.save!
        end
      end
      Client.where(online: false, id: client_ids).lock().each do |client|
        if !client.online
          client.online = true
          client.save!
        end
      end
    end
  end

  def send_event
    if saved_change_to_online || saved_change_to_test_requested
      PodStatusChannel.broadcast_to(CHANNELS[:clients_status], self)
    end

    PodAgentChannel.broadcast_test_requested self if saved_change_to_test_requested && test_requested

    PodAgentChannel.broadcast_version_changed self if saved_change_to_target_client_version_id
    # Notify both agent and watchdog when there's an update to the watchdog
    # The agent will know if it should update or leave it to the watchdog.
    PodAgentChannel.broadcast_watchdog_version_changed self if saved_change_to_target_watchdog_version_id
    WatchdogChannel.broadcast_version_changed self if saved_change_to_target_watchdog_version_id
  end

  def latest_download
    latest_measurement ? latest_measurement.download : nil
  end

  def latest_upload
    latest_measurement ? latest_measurement.upload : nil
  end

  def claim_remote_port
    # TODO: This is not safe with concurrent clients
    range = ENV.fetch('REMOTE_PORT_RANGE', nil)
    start_port, end_port = range.split('-').map { |i| i.to_i }
    current_max = Client.maximum(:remote_gateway_port)

    if current_max.nil?
      self.remote_gateway_port = start_port
    elsif current_max < end_port
      self.remote_gateway_port = current_max + 1
    else
      raise 'No more available server ports'
    end
  end

  def online?
    online
  end

  def test_requested?
    test_requested || location&.test_requested
  end

  def test_running?
    status == 'Test running'
  end

  def data_cap_next_period
    return Time.current if data_cap_current_period.nil?

    next_period_date = Time.current
    if daily?
      next_period_date = data_cap_current_period.tomorrow.at_end_of_day.to_date

    elsif weekly?
      next_period_date = data_cap_current_period.next_week.at_end_of_week.to_date

    elsif monthly?
      # For monthly expiration, use -1 if you want the last day of the month
      # In case of a day that is higher that the current month's, we use the last day of that month
      next_period_date = data_cap_current_period.next_month
      day_of_month = data_cap_day_of_month

      # set the day according to the day of the month
      if day_of_month == -1 || next_period_date.end_of_month.day < day_of_month
        day_of_month = next_period_date.end_of_month.day
      end
      next_period_date = next_period_date.change(day: day_of_month).to_date

    elsif yearly?
      next_period_date = data_cap_current_period.next_year.at_beginning_of_year.to_date

    end

    if next_period_date < Time.now
      # Ensures cases where the data_cap_current_period is way behind, making the .next_x_period still behind today
      next_period_date = Time.now
    end
    next_period_date
  end

  def self.refresh_outdated_data_usage!
    # For each Client, reset their current period usage in case
    # the current period is no longer valid (moved to another one)
    Client.all.each do |c|
      next unless c.data_cap_next_period.before?(Time.current)

      c.data_cap_current_period = c.data_cap_next_period
      c.data_cap_current_period_usage = 0.0
      c.save!
    end
  end

  def has_data_cap?
    data_cap_max_usage.nil? || data_cap_periodicity.nil? ||
      data_cap_max_usage > data_cap_current_period_usage
  end

  def add_bytes!(period, byte_size)
    Client.transaction do
      c = Client.lock('FOR UPDATE').find(id)
      if c.data_cap_current_period && c.data_cap_next_period&.before?(period)
        c.data_cap_current_period = period
        c.data_cap_current_period_usage = 0.0
      end
      c.data_cap_current_period_usage += byte_size
      c.save!
    end
    reload(lock: true)
  end

  def next_schedule_period_end
    t = nil
    case scheduling_periodicity
    when 'scheduler_hourly'
      t = scheduling_period_end.nil? ? Time.now.at_end_of_hour : scheduling_period_end.advance(hours: 1).at_end_of_hour

    when 'scheduler_daily'
      t = scheduling_period_end.nil? ? Time.now.at_end_of_day : scheduling_period_end.next_day.at_end_of_day

    when 'scheduler_weekly'
      t = scheduling_period_end.nil? ? Time.now.at_end_of_week : scheduling_period_end.next_week.at_end_of_week

    when 'scheduler_monthly'
      t = scheduling_period_end.nil? ? Time.now.at_end_of_month : scheduling_period_end.next_month.at_end_of_the_month

    end
    if t < Time.now
      self.scheduling_period_end = nil
      t = next_schedule_period_end
    end
    t
  end

  def schedule_next_test!(force = false)
    base_timestamp = Time.now
    return if test_scheduled_at.present? && test_scheduled_at > base_timestamp && !force

    self.scheduling_tests_in_period += 1
    if scheduling_period_end.nil?
      # Set it for the first time
      self.scheduling_tests_in_period = 0
      self.scheduling_period_end = next_schedule_period_end
    end

    if self.scheduling_tests_in_period >= scheduling_amount_per_period
      # We finished the number of tests for this period, change it to the next one
      self.scheduling_tests_in_period = 0
      base_timestamp = scheduling_period_end if scheduling_period_end > base_timestamp
      self.scheduling_period_end = next_schedule_period_end
    elsif scheduling_period_end < Time.now
      # It's time to set the next period
      self.scheduling_tests_in_period = 0
      self.scheduling_period_end = next_schedule_period_end
    end

    # If we were to split the N tests in equal parts, each test should be spaced by max_freq.
    # Since we want randomly spaced tests, we select the next test in a range between now and the max_freq.
    # In other words, select a time between the range (base_timestamp, base_timestamp + max_freq]
    max_freq = (scheduling_period_end - base_timestamp) / (scheduling_amount_per_period - self.scheduling_tests_in_period)

    self.test_scheduled_at = Time.at(base_timestamp + (max_freq * rand))
    save!
  end

  def self.request_scheduled_tests!
    Client.where_test_should_be_requested.each do |client|
      client.test_requested = true
      client.save!
    end
  end

  def data_usage_summary
    res = measurements.where(
      'created_at >= ?', Time.current.at_beginning_of_month
    ).pluck(Arel.sql('SUM(download_total_bytes)'), Arel.sql('AVG(download_total_bytes)'))
    summary = { month_sum: nil, month_avg: nil }
    if res
      summary[:month_sum] = res[0][0]
      summary[:month_avg] = res[0][1]
    end
    summary
  end

  def status
    if online?
      if test_requested?
        'Test running'
      else
        'Online'
      end
    else
      'Offline'
    end
  end

  def status_without_running
    online? ? 'Online' : 'Offline'
  end

  def status_suffix
    if online?
      if test_requested?
        'running'
      else
        'online'
      end
    else
      'offline'
    end
  end

  def status_suffix_without_running
    online? ? 'online' : 'offline'
  end

  def status_style
    if online? && !test_running?
      'custom-badge--online'
    elsif test_running?
      'custom-badge--running'
    else
      'custom-badge--offline'
    end
  end

  def has_pending_test
    !test_running? && test_requested?
  end

  def to_update_version
    target_client_version unless raw_version == 'Dev'
  end

  def to_update_watchdog_version
    target_watchdog_version unless raw_version == 'Dev'
  end

  def to_update_distribution
    update_version = to_update_version
    return if update_version.nil?

    update_version.distribution_by_name(distribution_name)
  end

  def to_update_signed_binary
    dist = to_update_distribution
    return if dist.nil?

    dist.signed_binary
  end

  def to_update_watchdog_signed_binary
    v = to_update_watchdog_version
    return unless v

    v.signed_binary
  end

  def to_update_binary
    dist = to_update_distribution
    return if dist.nil?

    dist.binary
  end

  def to_update_watchdog_binary
    v = to_update_watchdog_version
    return unless v

    v.binary
  end

  def has_update?
    target_client_version_id.present? && client_version_id != target_client_version_id
  end

  def has_watchdog_update?
    target_watchdog_version_id.present? && watchdog_version_id != target_watchdog_version_id &&
      raw_watchdog_version != 'Dev' && has_watchdog?
  end

  def latest_measurement
    # Extra condition for download/upload not being null just in case there is some bad state
    measurements.order(created_at: :desc).where('download IS NOT NULL AND upload IS NOT NULL').first
  end

  def get_measurement_data(total_bytes, correct_unit_fn = method(:get_value_in_preferred_unit), correct_unit)
    data_string = ''
    data_string += "~#{correct_unit_fn.call(total_bytes).round(0)} #{correct_unit} per test (" if total_bytes > 0
    data_string += "#{correct_unit_fn.call(data_cap_current_period_usage).round(0)} #{correct_unit} this month"
    data_string += ')' if total_bytes > 0
    data_string
  end

  def get_periodicity_period
    case data_cap_periodicity
    when 'daily'
      'day'
    when 'weekly'
      'week'
    when 'monthly'
      'month'
    when 'yearly'
      'year'
    else
      ''
    end
  end

  def get_scheduling_periodicity_period
    case scheduling_periodicity
    when 'scheduler_hourly'
      'per hour'
    when 'scheduler_daily'
      'per day'
    when 'scheduler_weekly'
      'per week'
    else
      'per month'
    end
  end

  def get_speed_averages(account_id)
    raw_query = 'SELECT AVG(download_total_bytes) as download, AVG(upload_total_bytes) as upload FROM ' +
                '(SELECT download_total_bytes, upload_total_bytes FROM measurements WHERE client_id = ? AND account_id = ? ' +
                'AND download_total_bytes IS NOT NULL AND upload_total_bytes IS NOT NULL LIMIT 10) AS total_avg'
    query = ActiveRecord::Base.sanitize_sql([raw_query, id, account_id])
    averages = ActiveRecord::Base.connection.execute(query)[0]
    download_avg = averages['download'] || 0
    upload_avg = averages['upload'] || 0
    download_avg + upload_avg
  end

  # Quick method for preventing division by zero
  def get_safe_data_cap_max_usage
    return 1 if data_cap_max_usage == 0

    data_cap_max_usage
  end

  def get_data_cap_percentage_usage
    percentage = (data_cap_current_period_usage * 100 / get_safe_data_cap_max_usage).floor(0)
    return 100 if percentage > 100

    percentage
  end

  def get_scheduling_periodicity_string
    "Tests are set to run #{scheduling_amount_per_period} #{scheduling_amount_per_period == 1 ? 'time' : 'times'} #{get_scheduling_periodicity_period}."
  end

  def get_scheduling_periodicity_value
    Client.scheduling_periodicities[scheduling_periodicity]
  end

  def get_data_cap_periodicity_value
    Client.data_cap_periodicities[data_cap_periodicity]
  end

  def self.to_csv_enumerator
    @enumerator = Enumerator.new do |yielder|
      yielder << CSV.generate_line(%w[id client_id user_id location_id name address latitude longitude pinged_at(UTC+0)
                                      created_at(UTC+0)])
      includes(:location, :user).find_each do |client|
        yielder << CSV.generate_line([
                                       client.id,
                                       client.unix_user,
                                       client.user ? client.user.id : '',
                                       client.location ? client.location.id : '',
                                       client.name,
                                       client.address,
                                       client.latitude,
                                       client.longitude,
                                       client.pinged_at ? client.pinged_at.strftime('%m/%d/%Y %H:%M:%S') : '',
                                       client.created_at.strftime('%m/%d/%Y %H:%M:%S')
                                     ])
      end
    end
  end

  def self.to_csv_file
    tmp_file = Tempfile.new('clients.csv')
    File.open(tmp_file.path, 'w') do |file|
      to_csv_enumerator.each_with_index do |line, _index|
        file.write(line)
      end
    end
    tmp_file
  end

  def is_eth?(interface)
    interface['name'].match(/eth\d+/)
  end

  def is_enps?(interface)
    interface['name'].match(/enp\d+s\d+/)
  end

  def is_en?(interface)
    interface['name'].match(/en\d+/)
  end

  def has_no_ethernet_interface?
    network_interfaces.filter { |i| i.present? && (is_eth?(i) || is_enps?(i) || is_en?(i)) }.size == 0
  end

  def get_default_interface
    network_interfaces.filter { |i| i.present? && i[:default_route] == true }
  end

  def get_mac_address
    return 'Not Available' if network_interfaces.nil?

    default_interface = get_default_interface
    if default_interface.size == 0
      network_interfaces[0]['mac'] # Just defaulting to the first one if no actual default_interface present?
    elsif default_interface.size == 1
      default_interface[0]['mac']
    else
      possible_interface = network_interfaces.filter { |i| i.present? && is_eth?(i) }
      return possible_interface[0]['mac'] if possible_interface.size >= 1

      possible_interface = network_interfaces.filter { |i| i.present? && is_en?(i) }
      return possible_interface[0]['mac'] if possible_interface.size >= 1

      possible_interface = network_interfaces.filter { |i| i.present? && is_enps?(i) }
      possible_interface[0]['mac'] # if we get to this point, we don't need to check for the length of filter result because it must be enps type
    end
  end

  # We suggest the nearest 10K based rounding up.
  # E.g. client's current data usage is 5302 MB ==> we suggest 10K MB
  # E.g. client's current data usage is 13451 MB ==> we suggest 20K MB
  def get_suggested_data_cap(correct_unit_fn = method(:get_value_in_preferred_unit))
    current_data_cap = correct_unit_fn.call(data_cap_current_period_usage).ceil(0)
    (current_data_cap / 10_000.0).ceil(0) * 10_000
  end

  def get_frequency_text
    day = data_cap_day_of_month
    case day
    when 1
      'Data usage will be reset on the first day of each month.'
    when -1
      'Data usage will be reset on the last day of each month.'
    else
      "Data usage will be reset every month on day #{day}."
    end
  end

  def in_service?
    in_service
  end

  def get_in_service_action_label
    "Mark as #{in_service? ? 'not in servce' : 'in service'}"
  end

  def get_status_timestamp
    evt = client_event_logs.where("name = 'WENT_ONLINE' OR name = 'WENT_OFFLINE'").order('id DESC').limit(1).pluck(:timestamp)
    return unless evt.length > 0
    return '-' if evt[0].nil?

    "Since #{evt[0].strftime('%b %d, %Y')}"
  end

  def request_test!
    update(test_requested: true)
  end

  private

  def create_ids
    o = [('a'..'z'), (0..9)].map(&:to_a).flatten - [0, 1, 'o', 'l']
    string = (0...11).map { o[rand(o.length)] }.join
    self.unix_user = "r#{string}"
  end

  def update_versions
    UpdateClientVersionsJob.perform_later update_group
    UpdateWatchdogVersionsJob.perform_later update_group
  end
end
