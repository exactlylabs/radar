module Schedulable extend ActiveSupport::Concern
  included do |klass|
    enum data_cap_periodicity: [:daily, :weekly, :monthly], _prefix: :data_cap
    enum scheduling_periodicity: [:hourly, :daily, :weekly, :monthly], _prefix: :scheduling

    scope :where_outdated_data_cap, -> { where("data_cap_current_period < ?", Time.current) }
    scope :where_pending_next_run, -> { where(%{
      (scheduling_next_run IS NULL OR scheduling_next_run <= NOW() AT TIME ZONE COALESCE(scheduling_time_zone, 'UTC'))
      AND (
        SELECT COUNT(1) = 0
        FROM scheduling_restrictions sr
        WHERE
          location_id = locations.id
          AND (NOW() AT TIME ZONE COALESCE(scheduling_time_zone, 'UTC'))::time BETWEEN sr.time_start AND sr.time_end
          AND ARRAY[EXTRACT(dow FROM NOW() AT TIME ZONE COALESCE(scheduling_time_zone, 'UTC'))::integer] <@ weekdays
      )
      AND (data_cap_max_usage IS NULL OR data_cap_current_usage < data_cap_max_usage)
      AND (SELECT COUNT(1) > 0 FROM clients WHERE online AND location_id = locations.id)
    }) }

    klass.extend(ClassMethods)
  end

  def next_data_cap_period(current_period_end)
    current_period = current_period_end.in_time_zone(self.scheduling_time_zone)
    next_period = if self.data_cap_daily?
      current_period.tomorrow.at_end_of_day
    elsif self.data_cap_weekly?
      current_period.next_week.at_end_of_week
    else
      current_period.next_month.at_end_of_month
    end


  end

  def next_scheduling_period(current_period_end)
    current_period = current_period_end.in_time_zone(self.scheduling_time_zone)
    next_start, next_end = if self.scheduling_hourly?
      [(current_period + 1.hour).at_beginning_of_hour, (current_period + 1.hour).at_end_of_hour]
    elsif self.scheduling_daily?
      [current_period.next_day.at_beginning_of_day, current_period.next_day.at_end_of_day]
    elsif self.scheduling_weekly?
      [current_period.next_week.at_beginning_of_week, current_period.next_week.at_end_of_week]
    else
      [current_period.next_month.at_beginning_of_month, current_period.next_month.at_end_of_month]
    end

    # In case this is too behind in the schedule, the next period could be before now.
    # in these cases, we move forward until reaching a valid period
    if next_end < Time.current
      return self.next_scheduling_period(next_end)
    end

    return next_start, next_end
  end

  ##
  #
  # Calculate Next Run splits the current period in "scheduling_max_count" sub-periods,
  #  and returns a random value in between the next sub-period.
  #
  ##
  def calculate_next_run(force = false)
    return self.scheduling_next_run if !force && self.scheduling_next_run.present? && self.scheduling_next_run > Time.current

    steps = (self.scheduling_current_period_end - self.scheduling_current_period_start) / self.scheduling_max_count
    sub_period_start = self.scheduling_current_period_start + self.scheduling_current_count * steps
    sub_period_end = self.scheduling_current_period_start + (self.scheduling_current_count + 1) * steps

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
      self.schedule_next_test!

      self.data_cap_current_usage += total_bytes
      self.scheduling_next_run = self.calculate_next_run
      self.save!
    end
  end

  def schedule_next_test!
    unless scheduling_next_run.present? && scheduling_next_run >= Time.current
      self.scheduling_current_count ||= 0
      self.scheduling_current_count += 1
    end

    # Could happen in new locations. Just set with the current value
    if self.scheduling_current_period_end.nil? || self.scheduling_current_period_start.nil?
      now = Time.current
      self.scheduling_current_period_start, self.scheduling_current_period_end = now, now
    end

    if self.scheduling_current_count >= self.scheduling_max_count || self.scheduling_current_period_end <= Time.current
      self.scheduling_current_count = 0
      self.scheduling_current_period_start, self.scheduling_current_period_end = self.next_scheduling_period(self.scheduling_current_period_end)
    end
  end

  module ClassMethods
    def refresh_outdated_data_usage!
      self.where_outdated_data_cap.each do |obj|
        obj.update(
          data_cap_current_period: obj.next_data_cap_period(obj.data_cap_current_period || Time.current),
          data_cap_current_usage: 0.0
        )
      end
    end

    def request_scheduled_tests!
      self.where_pending_next_run.each do |location|
        client = location.scheduling_selected_client
        if client.nil? || client.location != location || !client.online?
          # This client got removed from the network or is offline, pick a different one
          # If is offline, but same location, then cancel any requested tests to avoid duplicates

          client.update(test_requested: false) if client.present? && client.location == location
          client = location.clients.where_online.first
          location.update(scheduling_selected_client: client)
        end
        client.update(test_requested: true) unless client.nil? || client.test_requested?
      end
    end
  end
end
