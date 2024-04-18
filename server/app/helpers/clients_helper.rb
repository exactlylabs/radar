module ClientsHelper
  def client_status_to_human(param)
    case param
    when nil
      'All Pods'
    when 'online'
      Client::STATUSES::ONLINE
    else
      Client::STATUSES::OFFLINE
    end
  end

  def client_environment_to_human(param)
    if param.nil?
      'All environments'
    else
      param.capitalize()
    end
  end
end
