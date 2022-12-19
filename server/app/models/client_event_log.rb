class ClientEventLog < ApplicationRecord
  belongs_to :client

  # Possible Events
  CREATED = "CREATED"
  WENT_ONLINE = "WENT_ONLINE"
  WENT_OFFLINE = "WENT_OFFLINE"
  LOCATION_CHANGED = "LOCATION_CHANGED"
  ACCOUNT_CHANGED = "ACCOUNT_CHANGED"

  def self.create_event(client, name, data=nil, timestamp=nil)
    ClientEventLog.create(
      client: client,
      name: name,
      data: {"state" => client.to_json, "event_data" => data},
      timestamp: timestamp || Time.now
    )
  end

end
