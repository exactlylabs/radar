class ClientEventLog < ApplicationRecord
  belongs_to :client

  # Possible Events
  CREATED = "CREATED"
  WENT_ONLINE = "WENT_ONLINE"
  WENT_OFFLINE = "WENT_OFFLINE"
  LOCATION_CHANGED = "LOCATION_CHANGED"
  ACCOUNT_CHANGED = "ACCOUNT_CHANGED"
  IP_CHANGED = "IP_CHANGED"
  AS_CHANGED = "AUTONOMOUS_SYSTEM_CHANGED"
  IN_SERVICE = "IN_SERVICE"
  NOT_IN_SERVICE = "NOT_IN_SERVICE"

  def self.created_event(client, timestamp=nil)
    create_event client, CREATED, timestamp=timestamp
  end

  def self.went_online_event(client, timestamp=nil)
    create_event client, WENT_ONLINE, timestamp=timestamp
  end

  def self.went_offline_event(client, timestamp=nil)
    create_event client, WENT_OFFLINE, timestamp=timestamp
  end

  def self.location_changed_event(client, from, to, timestamp=nil)
    create_event client, LOCATION_CHANGED, data={"from" => from, "to" => to}, timestamp=timestamp
  end

  def self.account_changed_event(client, from, to, timestamp=nil)
    create_event client, ACCOUNT_CHANGED, data={"from" => from, "to" => to}, timestamp=timestamp
  end

  def self.ip_changed_event(client, from, to, timestmap=nil)
    create_event client, IP_CHANGED, data={"from" => from, "to" => to}, timestamp=timestamp
  end

  def self.autonomous_system_changed_event(client, from, to, timestmap=nil)
    create_event client, AS_CHANGED, data={"from" => from, "to" => to}, timestamp=timestamp
  end

  def self.in_service_event(client, timestamp=nil)
    create_event client, IN_SERVICE, timestamp=timestamp
  end

  def self.not_in_service_event(client, timestamp=nil)
    create_event client, NOT_IN_SERVICE, timestamp=timestamp
  end
  
  private 

  def self.create_event(client, name, data=nil, timestamp=nil)
    ClientEventLog.create(
      client: client,
      name: name,
      data: {"state" => client.as_json, "event_data" => data},
      timestamp: timestamp || Time.now
    )
  end

end
