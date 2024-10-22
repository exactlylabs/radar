module RangeEvaluator
  extend ActiveSupport::Concern
  LAST_24_HOURS = 'last_24_hours'.freeze
  LAST_7_DAYS = 'last_7_days'
  LAST_30_DAYS = 'last_30_days'
  THIS_YEAR = 'this_year'

  def human_filter_to_range(range)
    case range
    when 'last-week'
      [Time.now - 7.day, Time.now]
    when 'last-month'
      [Time.now - 30.day, Time.now]
    when 'last-six-months'
      [Time.now - 180.day, Time.now]
    when 'last-year'
      [Time.now - 365.day, Time.now]
    else
      [nil, Time.now]
    end
  end

  def get_range_start_date(type = LAST_24_HOURS)
    case type
    when LAST_24_HOURS
      Time.zone.now - 24.hours
    when LAST_7_DAYS
      Time.zone.now - 7.days
    when LAST_30_DAYS
      Time.zone.now - 30.days
    when THIS_YEAR
      Time.zone.now.beginning_of_year
    else
      Time.zone.now - 24.hours
    end
  end

  def get_current_and_previous_period(period = LAST_24_HOURS)
    current_period_end_date = Time.zone.now
    case period
    when LAST_24_HOURS
      curr_diff = 24.hours
      prev_diff = curr_diff
    when LAST_7_DAYS
      curr_diff = 7.days
      prev_diff = curr_diff
    when LAST_30_DAYS
      curr_diff = 30.days
      prev_diff = curr_diff
    when THIS_YEAR
      curr_diff = Time.zone.now.yday.days
      prev_diff = 1.year
    else
      curr_diff = 24.hours
      prev_diff = curr_diff
    end

    current_period_start_date = current_period_end_date - curr_diff
    previous_period_start_date = current_period_start_date - prev_diff

    [previous_period_start_date, current_period_start_date, current_period_end_date]
  end

end
