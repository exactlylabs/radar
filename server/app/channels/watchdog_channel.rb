class WatchdogChannel < ApplicationCable::Channel
  def subscribed
    stream_from WatchdogChannel.watchdog_stream_name self.client
  end

  def self.broadcast_update_group_version_changed(update_group)
    # Broadcast an update for each client
    update_group.clients.each do |client|
      broadcast(
        WatchdogChannel.watchdog_stream_name(client), 
        {
          event: "version_changed",
          payload: {
            version: update_group.watchdog_version.version,
            binary_url: update_group.watchdog_version.signed_binary.url,
          }
        }
      )
    end
  end

  def self.broadcast_watchdog_update_group_changed(client)
    if client.has_watchdog_update?
      broadcast(
        WatchdogChannel.watchdog_stream_name(client), 
        {
          event: "version_changed",
          payload: {
            version: client.to_update_watchdog_version.version,
            binary_url: client.to_update_watchdog_signed_binary.url,
          }
        }
      )
    end
  end
  
  # Actions called by the watchdog

  def sync(data)
    data = HashWithIndifferentAccess.new data["payload"]
    wv_ids = WatchdogVersion.where(version: params[:version]).pluck(:id)
    version_id = nil
    if wv_ids.length > 0
      version_id = wv_ids[0]
    end
    self.client.update(
      raw_watchdog_version: params[:version],
      watchdog_version_id: version_id,
    )
    if self.client.has_watchdog_update?
      request_update
    end
  end


  private 
  
  # Commands to the watchdog -- Called only during the sync process at the beginning of the connection

  def update()
    self.connection.transmit(
      {
        type: "update",
        message: {
          version: client.to_update_watchdog_version.version,
          binary_url: client.to_update_watchdog_signed_binary.url
        },
      }
    )
  end

  def self.watchdog_stream_name(client)
    "watchdog_stream_#{client.unix_user}"
  end
end
