module ClientsHelper
  def client_status_to_human(param)
    case param
    when nil
      'All Pods'
    when 'online'
      'Online'
    else
      'Offline'
    end
  end
end
