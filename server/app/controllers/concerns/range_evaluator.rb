module RangeEvaluator
  extend ActiveSupport::Concern

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

  def get_range_start_date(type = 'last_24_hours')
    case type
    when 'last_24_hours'
      Time.zone.now - 24.hours
    when 'last_7_days'
      Time.zone.now - 7.days
    when 'last_30_days'
      Time.zone.now - 30.days
    when 'this_year'
      Time.zone.now.beginning_of_year
    else
      Time.zone.now - 24.hours
    end
  end

  def get_current_and_previous_period(period = 'last_24_hours')
    current_period_end_date = Time.zone.now
    case period
    when 'last_24_hours'
      curr_diff = 24.hours
      prev_diff = curr_diff
    when 'last_7_days'
      curr_diff = 7.days
      prev_diff = curr_diff
    when 'last_30_days'
      curr_diff = 30.days
      prev_diff = curr_diff
    when 'this_year'
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
