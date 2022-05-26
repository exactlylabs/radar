module MeasurementsHelper

  def determine_measurements_style_path(entity, type, style)
    if params[:style] == style
      case type
      when 'clients'
        client_measurements_path(entity, range: params[:range])
      else
        location_measurements_path(entity, range: params[:range])
      end
    else
      case type
      when 'clients'
        client_measurements_path(entity, style: style, range: params[:range])
      else
        location_measurements_path(entity, style: style, range: params[:range])
      end
    end
  end

  def determine_measurements_range_path(entity, type, range)
    if params[:range] == range
      case type
      when 'clients'
        client_measurements_path(entity, style: params[:style])
      else
        location_measurements_path(entity, style: params[:style])
      end
    else
      case type
      when 'clients'
        client_measurements_path(entity, range: range, style: params[:style])
      else
        location_measurements_path(entity, range: range, style: params[:style])
      end
    end
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
