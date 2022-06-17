module LocationMeasurementsHelper
  def parse_param_to_human(param)
    case param
    when 'NDT7'
      'Ndt7'
    when 'OOKLA'
      'Ookla'
    when 'last-week'
      'Last week'
    when 'last-month'
      'Last month'
    when 'last-6-months'
      'Last 6 months'
    when 'last-year'
      'Last year'
    when 'all-time'
      'All time'
    end
  end
end