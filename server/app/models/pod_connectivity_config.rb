class PodConnectivityConfig < ApplicationRecord
  belongs_to :client
  belongs_to :wlan_interface, class_name: "PodNetworkInterface", optional: true, foreign_key: :wlan_interface_id

  after_save :broadcast_update

  def broadcast_update
    if saved_change_to_wlan_interface_id?
      WatchdogChannel.broadcast_set_wlan_interface(self.client, self.wlan_interface&.name)
    end

    if saved_change_to_wlan_enabled?
      WatchdogChannel.broadcast_disconnect_wireless(self.client) unless self.wlan_enabled?
      WatchdogChannel.broadcast_select_ssid(self.client, self.selected_ssid) if self.wlan_enabled? && self.selected_ssid.present?
    end
  end

  def ensure_wifi_state!(interface_name, wlan_status)
    # Ensure the interface is correctly set
    expected_interface = self.wlan_interface&.name || ""
    if expected_interface != interface_name
      WatchdogChannel.broadcast_set_wlan_interface(self.client, expected_interface)
    end

    # Compare the pod current connection state against the expected state
    if wlan_status.present?
      connected = wlan_status[:status] == "COMPLETED"
      self.update!(wlan_connected: connected, current_ssid: wlan_status[:ssid] || nil)

      if !self.wlan_enabled? || (self.selected_ssid.blank? && connected)
        WatchdogChannel.broadcast_disconnect_wireless(self.client)
      elsif self.wlan_enabled? && self.selected_ssid.present? && self.selected_ssid != wlan_status[:ssid]
        WatchdogChannel.broadcast_select_ssid(self.client, self.selected_ssid)
      end

    else
      self.update!(wlan_connected: false, current_ssid: nil)
      WatchdogChannel.broadcast_select_ssid(self.client, self.selected_ssid) if self.wlan_enabled? && self.selected_ssid.present?
    end
  end

  def connect_to_ssid!(ssid, psk)
    # Connect to SSID is an asynchronous operation.
    # Prior to calling this, make sure to subscribe to the watchdog pub channel, and wait for either:
    # - `wireless_connection_state_changed`, with state == "connected".
    # - `action_error_report`, with action == `connect_to_wireless_network`.
    #
    WatchdogChannel.broadcast_connect_to_ssid(self.client, ssid, psk)
    self.update!(selected_ssid: ssid)
  end

  def disconnect_wireless!()
    # Disconnect the pod from the current wireless network.
    # This is an asynchronous operation, so make sure to subscribe to subscribe to the watchdog pub channel, and wait for either:
    # - `wireless_connection_state_changed`, with state == "disconnected".
    # - `action_error_report`, with action == `disconnect_wireless_network`.
    #
    WatchdogChannel.broadcast_disconnect_wireless(self.client)
    self.update!(selected_ssid: nil)
  end

  def scan_networks()
    # Scan for wireless networks using the configured network interface.
    # This is an asynchronous operation, so make sure to subscribe to subscribe to the watchdog pub channel, and wait for either:
    # - `access_points_found`, with a list of networks.
    # - `action_error_report`, with action == `scan_wireless_networks`.
    #
    WatchdogChannel.broadcast_scan_wireless_networks(self.client)
  end

  def report_wireless_status()
    # Report the current wireless status.
    # This is an asynchronous operation, so make sure to subscribe to subscribe to the watchdog pub channel, and wait for either:
    # - `wireless_status_report`.
    # - `action_error_report`, with action == `report_wireless_status`.
    #
    WatchdogChannel.broadcast_report_wireless_status(self.client)
  end
end
