class WatchdogChannel < ApplicationCable::Channel
  def subscribed
    stream_from WatchdogChannel.watchdog_stream_name self.client
  end

  def self.broadcast_version_changed(client)
    if client.has_watchdog_update? && client&.target_watchdog_version&.signed_binary.present?
      ActionCable.server.broadcast(
        WatchdogChannel.watchdog_stream_name(client),
        {
          event: "version_changed",
          payload: {
            version: client.target_watchdog_version.version,
            binary_url: WatchdogChannel.blob_path(client.target_watchdog_version.signed_binary),
          }
        }
      )
    end
  end

  def self.broadcast_update_group_version_changed(update_group)
    # Broadcast an update for each client
    update_group.clients.each do |client|
      if client.has_watchdog_update?
        ActionCable.server.broadcast(
          WatchdogChannel.watchdog_stream_name(client),
          {
            event: "version_changed",
            payload: {
              version: update_group.watchdog_version.version,
              binary_url: WatchdogChannel.blob_path(update_group.watchdog_version.signed_binary),
            }
          }
        )
      end
    end
  end

  def self.broadcast_watchdog_update_group_changed(client)
    if client.has_watchdog_update?
      ActionCable.server.broadcast(
        WatchdogChannel.watchdog_stream_name(client),
        {
          event: "version_changed",
          payload: {
            version: client.to_update_watchdog_version.version,
            binary_url: WatchdogChannel.blob_path(client.to_update_watchdog_signed_binary),
          }
        }
      )
    end
  end

  def self.broadcast_ndt7_diagnose_requested(client)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        event: "ndt7_diagnose_requested", payload: {}
      }
    )
  end

  # Actions called by the watchdog

  def sync(data)
    data = HashWithIndifferentAccess.new data["payload"]
    wv_ids = WatchdogVersion.where(version: data[:version]).pluck(:id)
    version_id = nil
    if wv_ids.length > 0
      version_id = wv_ids[0]
    end
    self.client.update(
      raw_watchdog_version: data[:version],
      has_watchdog: true,
      watchdog_version_id: version_id,
    )
    if self.client.has_watchdog_update?
      update
    end
  end

  def ndt7_diagnose_report(data)
    Ndt7DiagnoseReport.create client: self.client, report: data["payload"]
  end


  private

  # Commands to the watchdog -- Called only during the sync process at the beginning of the connection

  def update()
    self.connection.transmit(
      {
        type: "update",
        message: {
          version: self.client.to_update_watchdog_version.version,
          binary_url: WatchdogChannel.blob_path(self.client.to_update_watchdog_signed_binary)
        },
      }
    )
  end

  def self.watchdog_stream_name(client)
    "watchdog_stream_#{client.unix_user}"
  end

end
