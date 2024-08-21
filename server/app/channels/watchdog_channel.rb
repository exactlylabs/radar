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
    ) unless auth_key.nil?
  end

  def self.broadcast_wireless_scan_requested(client)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        event: "scan_wireless_networks",
        payload: {}
      }
    )
  end

  def self.broadcast_wifi_configuration_created(wifi_configuration, password)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(wifi_configuration.client),
      {
        "event": "configure_wireless_network",
        "payload": {
          "ssid": wifi_configuration.ssid,
          "password": password,
          "identity": wifi_configuration.identity,
          "security": wifi_configuration.security,
          "hidden": wifi_configuration.hidden?,
          "enabled": wifi_configuration.enabled?
        }
      }
    )
  end

  def self.broadcast_wifi_configuration_updated(wifi_configuration, password: nil)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(wifi_configuration.client),
      {
        "event": "configure_wireless_network",
        "payload": {
          "ssid": wifi_configuration.ssid,
          "password": password,
          "identity": wifi_configuration.identity,
          "security": wifi_configuration.security,
          "hidden": wifi_configuration.hidden?,
          "enabled": wifi_configuration.enabled?
        }
      }
    )
  end

  def self.broadcast_wifi_configuration_deleted(wifi_configuration)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(wifi_configuration.client),
      {
        "event": "delete_wireless_network",
        "payload": {
          "ssid": wifi_configuration.ssid
        }
      }
    )
  end

  def self.broadcast_connection_report_requested(client)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        "event": "report_wireless_status",
        "payload": {}
      }
    )
  end

  def self.broadcast_report_logs(client, n: 100, services: nil)
    services = ["radar_agent", "podwatchdog@tty1"] if services.nil?
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        "event": "report_logs",
        "payload": {lines: n, services: services}
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

    self.connection_status_report("payload" => data["connections_status"])
  end

  def tailscale_connected(data)
    TailscaleAuthKey.find_by_key_id(data["payload"]["key_id"]).consumed!
  end

  def tailscale_disconnected(data)
    TailscaleAuthKey.find_by_key_id(data["payload"]["key_id"]).revoke!
  end

  def access_points_found(data)
    # Example of response:
    # {:event=>"access_points_found", :payload=>{"aps"=> [
    #   {"ssid"=>"MySSID", "connected"=>false, "registered"=>true, "bss"=>{"id"=>66, "bssid"=>"f4:54:20:00:83:c6", "ssid"=>"MySSID", "freq"=>5560, "beacon_int"=>100, "capacity"=>1297, "quality"=>0, "noise"=>-92, "level"=>-35, "tsf"=>0, "age"=>0, "est_throughput"=>390001, "snr"=>57, "flags"=>["WPA2-PSK-CCMP", "WPS", "ESS"]}, "channel"=>112, "rssi"=>0, "signal"=>-35},
    # ]}, :client => ...}

    # NOTE FOR FUTURE IMPLEMENTATION: We may need to store the last Scan result in the DB / Redis so the server can render through HTML,
    # otherwise this will need all list population to be done through stimulus controllers.
    WatchdogPubChannel.broadcast_to(self.client, {event: "access_points_found", payload: data["payload"], client: self.client})
  end

  def connection_status_report(data)
    connection = self.client.pod_connection
    wlan_data = data["payload"]["wlan"]
    eth_data = data["payload"]["ethernet"]
    connection.update!(
      wlan_status: wlan_data["status"],
      current_ssid: wlan_data["ssid"],
      wlan_signal: wlan_data["signal_strength"],
      wlan_frequency: wlan_data["frequency"],
      wlan_link_speed: wlan_data["link_speed"],
      wlan_channel: wlan_data["channel"],
      ethernet_status: eth_data["status"],
    )
    connection.save!

    WatchdogPubChannel.broadcast_to(self.client, {event: "connection_status_changed", payload: connection })
  end

  def wireless_connection_state_changed(data)
    # States: connected, connected_no_internet, disconnected
    # {:event=>"wireless_connection_state_changed", :payload=>{"state"=>"connected"}, :client=> ...}
    self.client.pod_connection.update!(
      wlan_status: data["payload"]["state"], current_ssid: data["payload"]["ssid"]
    )
    WatchdogPubChannel.broadcast_to(self.client, {event: "wireless_state_changed", payload: self.client.pod_connection})
  end

  def logs_report(data)
    content = ""
    data["payload"].each do |k, v|
      content += "#{k}: #{v}\n"
    end
    Rails.logger.error("#{self.client.unix_user} Logs Received:\n#{content}")
  end

  def action_error_report(data)
    # payload has the following fields: {action: "which action triggered this", "error: "an internal error message", "error_type": "machine readable error type"}
    # Possible error types are:
    #   * NotRegisteredError -> When trying to connect to an non existing SSID
    #   * NotConnectedError -> When trying to perform action that requires a connection to be stabilished
    #   * TimeOutError -> When Trying to connect to an SSID takes longer than the internal time out defined in the watchdog
    Rails.logger.error("#{self.client.unix_user} Action Error: \n#{data["payload"]}")
    WatchdogPubChannel.broadcast_to(self.client, {event: "action_error_report", payload: data["payload"], client: self.client})
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
