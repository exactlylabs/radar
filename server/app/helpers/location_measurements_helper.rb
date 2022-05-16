module LocationMeasurementsHelper

  def determine_style_url(location, style)
    params[:style] == style ? location_measurements_path(location, range: params[:range]) : location_measurements_path(location, style: style, range: params[:range])
  end

  def determine_range_url(location, range)
    params[:range] == range ? location_measurements_path(location, style: params[:style]) : location_measurements_path(location, style: params[:style], range: range)
  end

  def url_with_style_param(param)
    location_measurements_path(@location, range: 'last-week', style: params[:style])
  end

  def url_without_style_param
    location_measurements_path(@location, range: 'last-week', style: params[:style])
  end

  def parse_param(param)
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