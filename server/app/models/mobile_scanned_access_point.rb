class MobileScannedAccessPoint < ApplicationRecord
  include EventSourceable

  module Events
    CREATED = "CREATED"
    SSID_CHANGED = "SSID_CHANGED"
    CAPABILITIES_CHANGED = "CAPABILITIES_CHANGED"
    FREQUENCY_CHANGED = "FREQUENCY_CHANGED"
    CENTER_FREQ_0_CHANGED = "CENTER_FREQ_0_CHANGED"
    CENTER_FREQ_1_CHANGED = "CENTER_FREQ_1_CHANGED"
    IS_80211MC_RESPONDER_CHANGED = "IS_80211MC_RESPONDER_CHANGED"
    CHANNEL_WIDTH_CHANGED = "CHANNEL_WIDTH_CHANGED"
    IS_PASSPOINT_NETWORK_CHANGED = "IS_PASSPOINT_NETWORK_CHANGED"
    WIFI_STANDARD_CHANGED = "WIFI_STANDARD_CHANGED"
    SIGNAL_MEASURED = "SIGNAL_MEASURED"
  end

  notify_change :ssid, Events::SSID_CHANGED
  notify_change :capabilities, Events::CAPABILITIES_CHANGED
  notify_change :frequency, Events::FREQUENCY_CHANGED
  notify_change :center_freq0, Events::CENTER_FREQ_0_CHANGED
  notify_change :center_freq1, Events::CENTER_FREQ_1_CHANGED
  notify_change :is80211mc_responder, Events::IS_80211MC_RESPONDER_CHANGED
  notify_change :channel_width, Events::CHANNEL_WIDTH_CHANGED
  notify_change :is_passpoint_network, Events::IS_PASSPOINT_NETWORK_CHANGED
  notify_change :wifi_standard, Events::WIFI_STANDARD_CHANGED


  def self.register_measurement(id, level, latitude, longitude, timestamp)
    data = { signal_level: level, latitude: latitude, longitude: longitude }
    MobileScannedAccessPoint.find(id).record_event(Events::SIGNAL_MEASURED, data, timestamp)
  end
end
