module DashboardHelper
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