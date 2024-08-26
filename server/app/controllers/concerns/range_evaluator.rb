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
end