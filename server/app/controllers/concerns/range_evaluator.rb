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

  def get_range_start_date(type)
    case type
    when 'today'
      Time.zone.now.beginning_of_day
    when 'month'
      Time.zone.now.beginning_of_month
    when 'year'
      Time.zone.now.beginning_of_year
    else
      Time.zone.now.beginning_of_day
    end
  end
end