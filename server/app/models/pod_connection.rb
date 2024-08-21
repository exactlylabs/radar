class PodConnection < ApplicationRecord
  include EventSourceable

  belongs_to :client

  module Events
    CREATED = "CREATED"
    WLAN_STATUS_CHANGED = "WLAN_STATUS_CHANGED"
    ETHERNET_STATUS_CHANGED = "ETHERNET_STATUS_CHANGED"
    CURRENT_SSID_CHANGED = "CURRENT_SSID_CHANGED"
  end

  enum ethernet_status: { connected_with_internet: 0, connected_no_internet: 1, disconnected: 2}, _prefix: :ethernet
  enum wlan_status: { connected_with_internet: 0, connected_no_internet: 1, disconnected: 2 }, _prefix: :wlan

  notify_change :wlan_status, Events::WLAN_STATUS_CHANGED
  notify_change :ethernet_status, Events::ETHERNET_STATUS_CHANGED
  notify_change :current_ssid, Events::CURRENT_SSID_CHANGED

  def scan_networks()
    # Scan for wireless networks using the configured network interface.
    # This is an asynchronous operation, so make sure to subscribe to subscribe to the watchdog pub channel, and wait for either:
    # - `access_points_found`, with a list of networks.
    # - `action_error_report`, with action == `scan_wireless_networks`.
    #
    WatchdogChannel.broadcast_wireless_scan_requested(self.client)
  end

  def request_connection_report()
    # Request a report of the current connection status.
    # This is an asynchronous operation, so make sure to subscribe to subscribe to the watchdog pub channel, and wait for either:
    # - This model broadcast through the Client subscription.
    # - `action_error_report`, with action == `report_wireless_status`.
    #
    WatchdogChannel.broadcast_connection_report_requested(self.client)
  end
end
