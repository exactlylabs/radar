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

  def self.broadcast_scan_wireless_networks(client)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        event: "scan_wireless_networks",
        payload: {}
      }
    )
  end

  def self.broadcast_connect_to_ssid(client, ssid, psk)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        "event": "connect_to_wireless_network",
        "payload": {
          "ssid": ssid,
          "psk": psk,
        }
      }
    )
  end

  def self.broadcast_select_ssid(client, ssid)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        "event": "select_wireless_network",
        "payload": {
          "ssid": ssid,
        }
      }
    )
  end

  def self.broadcast_report_wireless_status(client)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        "event": "report_wireless_status",
        "payload": {}
      }
    )
  end

  def self.broadcast_set_wlan_interface(client, interface)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        "event": "set_wlan_interface",
        "payload": {
          "interface": interface,
        }
      }
    )
  end

  def self.broadcast_disconnect_wireless(client)
    ActionCable.server.broadcast(
      WatchdogChannel.watchdog_stream_name(client),
      {
        "event": "disconnect_wireless_network",
        "payload": {}
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

    self.client.pod_connectivity_config.ensure_wifi_state!(data[:wlan_interface], data[:wlan_status])
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

  def access_points_found(data)
    # Example of response:
    # {:event=>"access_points_found", :payload=>{"aps"=> [
    #   {"ssid"=>"MySSID", "connected"=>false, "registered"=>true, "bss"=>{"id"=>66, "bssid"=>"f4:54:20:00:83:c6", "ssid"=>"MySSID", "freq"=>5560, "beacon_int"=>100, "capacity"=>1297, "quality"=>0, "noise"=>-92, "level"=>-35, "tsf"=>0, "age"=>0, "est_throughput"=>390001, "snr"=>57, "flags"=>["WPA2-PSK-CCMP", "WPS", "ESS"]}, "channel"=>112, "rssi"=>0, "signal"=>-35},
    # ]}, :client => ...}

    WatchdogPubChannel.broadcast_to(CHANNELS[:watchdog_pub], {event: "access_points_found", payload: data["payload"], client: self.client})
  end

  def wireless_status_report(data)
    # Example of response:
    # {:event=>"wireless_status_report", :payload=>{"status"=>{"status"=>"COMPLETED", "signal_strength"=>-37, "link_speed"=>292, "frequency"=>5560, "channel"=>112, "width"=>"80 MHz", "noise"=>9999, "ip"=>"192.168.15.29", "ssid"=>"MySSID", "key_management"=>""}}, :client => ...}

    if data["payload"]["status"]["ssid"].present?
      self.client.pod_connectivity_config.update!(current_ssid: data["payload"]["status"]["ssid"])
    else
      self.client.pod_connectivity_config.update!(current_ssid: nil)
    end
    WatchdogPubChannel.broadcast_to(CHANNELS[:watchdog_pub], {event: "wireless_status_report", payload: data["payload"], client: self.client})
  end

  def wireless_connection_state_changed(data)
    # States: connected, disconnected
    # {:event=>"wireless_connection_state_changed", :payload=>{"state"=>"connected"}, :client=> ...}

    if data["payload"]["state"] == "connected"
      self.client.pod_connectivity_config.update!(wlan_connected: true, current_ssid: data["payload"]["ssid"])
    elsif data["payload"]["state"] == "disconnected"
      self.client.pod_connectivity_config.update!(wlan_connected: false, current_ssid: nil)
    end
    WatchdogPubChannel.broadcast_to(CHANNELS[:watchdog_pub], {event: "wireless_connection_state_changed", payload: data["payload"], client: self.client})
  end

  def action_error_report(data)
    # payload has the following fields: {action: "which action triggered this", "error: "an internal error message", "error_type": "machine readable error type"}
    # Possible error types are:
    #   * NotRegisteredError -> When trying to connect to an non existing SSID
    #   * NotConnectedError -> When trying to perform action that requires a connection to be stabilished
    #   * TimeOutError -> When Trying to connect to an SSID takes longer than the internal time out defined in the watchdog
    WatchdogPubChannel.broadcast_to(CHANNELS[:watchdog_pub], {event: "action_error_report", payload: data["payload"], client: self.client})
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
