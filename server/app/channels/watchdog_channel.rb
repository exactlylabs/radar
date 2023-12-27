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

  def self.broadcast_debug_enabled(client)
    auth_key = client.active_tailscale_key
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        event: "enable_tailscale",
        payload: {
          key_id: auth_key.key_id,
          auth_key: auth_key.raw_key,
          tags: ["tag:pod"],
        }
      }
    )
  end

  def self.broadcast_debug_disabled(client)
    auth_key = client.tailscale_auth_keys.where_consumed.last
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        event: "disable_tailscale",
        payload: {
          key_id: auth_key.key_id,
        }
      }
    )
  end

  # Actions called by the watchdog

  def sync(data)
    data = HashWithIndifferentAccess.new data["payload"]
    version_id = WatchdogVersion.where(version: data[:version]).pluck(:id).first

    self.client.update(
      raw_watchdog_version: data[:version],
      has_watchdog: true,
      watchdog_version_id: version_id,
    )
    if self.client.has_watchdog_update?
      update
    end
    if self.client.debug_enabled? && !data[:tailscale_connected]
      enable_tailscale(self.client.active_tailscale_key)
    end
  end

  def ndt7_diagnose_report(data)
    Ndt7DiagnoseReport.create client: self.client, report: data["payload"]
  end

  def tailscale_connected(data)
    TailscaleAuthKey.find_by_key_id(data["payload"]["key_id"]).consumed!
  end

  def tailscale_disconnected(data)
    TailscaleAuthKey.find_by_key_id(data["payload"]["key_id"]).revoke!
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

  def enable_tailscale(auth_key)
    self.connection.transmit({
      type: "enable_tailscale",
      message: {
        key_id: auth_key.key_id,
        auth_key: auth_key.raw_key,
        tags: ["tag:pod"],
      }
    })
  end

  def disable_tailscale()
    self.connection.transmit({
      type: "disable_tailscale",
      message: {},
    })
  end

  def self.watchdog_stream_name(client)
    "watchdog_stream_#{client.unix_user}"
  end

end
