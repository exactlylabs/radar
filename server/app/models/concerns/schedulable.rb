module Schedulable extend ActiveSupport::Concern
  enum :data_cap_periodicity: [:daily, :weekly, :monthly], _prefix: :data_cap
  enum :scheduling_periodicity: [:hourly, :daily, :weekly, :monthly], _prefix: :scheduling

  scope :where_outdated_data_cap, -> { where("data_cap_current_period < ?", Time.current) }
  scope :where_pending_next_run, -> { where(%{
    (scheduling_next_run <= NOW() AT TIME ZONE COALESCE(scheduling_time_zone, 'UTC') OR scheduling_next_run IS NULL)
    AND (
      (test_allowed_time_end IS NULL AND test_allowed_time_start IS NULL)
      OR (
        CASE WHEN test_allowed_time_end < test_allowed_time_start THEN
          ((NOW() AT TIME ZONE COALESCE(test_allowed_time_tz, 'UTC'))::time NOT BETWEEN test_allowed_time_end AND test_allowed_time_start)
        ELSE
          ((NOW() AT TIME ZONE COALESCE(test_allowed_time_tz, 'UTC'))::time BETWEEN test_allowed_time_start AND test_allowed_time_end)
        END
      )
    )
    AND (data_cap_max_usage IS NULL OR data_cap_current_period_usage < data_cap_max_usage)
  }) }

  def next_data_cap_period
    if data_cap_current_period.nil?
      data_cap_current_period = Time.current
    end

    current_period = data_cap_current_period.in_time_zone(scheduling_time_zone)
    if data_cap_daily?
      current_period.tomorrow.at_end_of_day
    elsif data_cap_weekly?
      current_period.next_week.at_end_of_week
    else
      current_period.next_month.at_end_of_month
    end
  end

  def next_scheduling_period
    if scheduling_next_run.nil?
      scheduling_next_run = Time.current
    end
    current_period = scheduling_current_period_start.in_time_zone(scheduling_time_zone)
    if scheduling.hourly?
      [current_period.next_hour.at_beginning_of_hour, current_period.next_hour.at_end_of_hour]
    elsif scheduling.daily?
      [current_period.next_day.at_beginning_of_day, current_period.next_day.at_end_of_day]
    elsif scheduling.weekly?
      [current_period.next_week.at_beginning_of_week, current_period.next_week.at_end_of_week]
    else
      [current_period.next_month.at_beginning_of_month, current_period.next_month.at_end_of_month]
    end
  end

  ##
  #
  # Calculate Next Run splits the current period in "scheduling_max_count" sub-periods,
  #  and returns a random value in between the next sub-period.
  #
  ##
  def calculate_next_run(force = false)
    return scheduling_next_run if !force && scheduling_next_run.present? && scheduling_next_run > Time.current

    steps = (scheduling_current_period_end - scheduling_current_period_start) / scheduling_max_count
    sub_period_start = scheduling_current_period_start + scheduling_current_count * steps
    sub_period_end = scheduling_current_period_start + (scheduling_current_count + 1) * steps

    # Pick a random time between the sub-period start and end
    Time.at(sub_period_start + (sub_period_end - sub_period_start) * rand)

    # If we were to split the remaining N runs in equal parts, each run should be spaced by max_freq.
    # Since we want randomly spaced tests, we select the next test in a range between now and the max_freq.
    # In other words, select a time between the range (base_timestamp, base_timestamp + max_freq]
    # max_freq = (scheduling_current_period - base_timestamp) / (scheduling_max_count - scheduling_current_count)
    # return Time.at(base_timestamp + (max_freq * rand))
  end

  ###
  #
  # Compute a test adds up the total bytes to the current data cap,
  # and schedules the next run based on the periodicity and max count.
  #
  # Given a single run can include multiple tests, we lock this record to prevent concurrency issues
  # when computing the next run.
  #
  ##
  def compute_test!(total_bytes)
    self.transaction do
      self.lock!
      unless scheduling_next_run.nil? || scheduling_next_run >= Time.current
        # This is the first test from the run. Compute the next schedule
        scheduling_current_count += 1
        if scheduling_current_count >= scheduling_max_count
          scheduling_current_count = 0
          scheduling_current_period_start, scheduling_current_period_end = self.next_scheduling_period
        end
      end
      scheduling_next_run = self.calculate_next_run
      data_cap_current_usage += total_bytes
      self.save!
    end
  end

  def self.refresh_outdated_data_usage!
    self.where_outdated_data_cap.each do |obj|
      obj.update(
        data_cap_current_period: self.next_data_cap_period,
        data_cap_current_usage: 0.0
      )
    end
  end

  def self.request_scheduled_tests!
    self.where_pending_next_run.each do |location|
      client = location.scheduling_selected_client
      if client.nil? || client.location != location
        # This client got removed from the network, pick a different one
        client = location.clients.where_online.first
        location.update(scheduling_selected_client: client)
      end
      client.update(test_requested: true) unless client.nil? || client.test_requested?
    end
  end
end
