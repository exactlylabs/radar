module DashboardHelper
  def determine_filter_url(filter)
    params[:filter] == filter ? dashboard_path : dashboard_path(filter: filter)
  end

  def parse_filter_param(param)
    case param
    when 'active'
      'Active locations'
    when 'inactive'
      'Inactive locations'
    else
      'All locations'
    end
  end
end