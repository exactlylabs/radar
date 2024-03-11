class ProcessMobileScansJob < ApplicationJob
  queue_as :mobile_scans
  self.log_arguments = false

  def perform(obj)
    proto_binary = obj.binary_message.download
    proto_binary = proto_binary.pack('C*') if proto_binary.is_a? Array

    message = WsMobileMessagesPb::WSMessage.decode(proto_binary)
    raw_message = message.to_h

    case message.event
    when :SCAN_RESULT
      message.scan_result.scanned_aps.each_with_index do |ap, idx|
        obj.mobile_scan_result_aps.create!(
          bssid: ap.bssid,
          ssid: ap.ssid,
          level: ap.level,
          capabilities: ap.capabilities,
          frequency: ap.frequency,
          center_freq0: ap.center_freq0,
          center_freq1: ap.center_freq1,
          is80211mc_responder: ap.is80211mc_responder,
          channel_width: ap.channel_width,
          is_passpoint_network: ap.is_passpoint_network,
          wifi_standard: ap.wifi_standard,
          information_elements: ap.information_elements.map { |ie| ie.bytes },
        )
        raw_message[:scan_result][:scanned_aps][idx][:information_elements] = raw_message[:scan_result][:scanned_aps][idx][:information_elements].map { |ie| ie.bytes }
      end
    end

    obj.update!(
      session_id: message.scan_result.session_id,
      processed_at: Time.now,
      latitude: message.scan_result.latitude,
      longitude: message.scan_result.longitude,
      device_data: message.scan_result.metadata.to_h,
      raw_decoded_message: raw_message
    )
  end

  private

end
