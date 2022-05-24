module ClientsHelper
  def client_status_to_human(param)
    case param
    when nil, 'all'
      'All Pods'
    when 'online'
      'Online'
    else
      'Offline'
    end
  end

  def run_test_on_every_client(clients)
    clients.each do |client|
      # Trigger run tests from each client ?? bulk post?
    end
  end
end
