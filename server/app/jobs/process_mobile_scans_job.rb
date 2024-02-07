class ProcessMobileScansJob < ApplicationJob
  queue_as :mobile_scans
  self.log_arguments = false

  def perform(proto_binary)
    proto_binary = proto_binary.pack('C*') if proto_binary.is_a? Array
    message = WsMobileMessagesPb::WSMessage.decode(proto_binary)
    case message.event
    when :SCAN_RESULT
      message.scan_result.scanned_aps.each do |ap|
        cache_key = "BSSIDs-#{ap.bssid}"
        cached_obj = REDIS.hgetall(cache_key)
        if cached_obj.blank?
          obj = MobileScannedAccessPoint.find_by_bssid(ap.bssid)
          if obj.nil?
            obj = MobileScannedAccessPoint.create!(
              bssid: ap.bssid,
              ssid: ap.ssid,
              capabilities: ap.capabilities,
              frequency: ap.frequency,
              center_freq0: ap.center_freq0,
              center_freq1: ap.center_freq1,
              is80211mc_responder: ap.is80211mc_responder,
              channel_width: ap.channel_width,
              is_passpoint_network: ap.is_passpoint_network,
              wifi_standard: ap.wifi_standard
            )
          end
          cached_obj = obj.as_json
          REDIS.hset(cache_key, cached_obj)
          REDIS.expire(cache_key, 600) # TL 10 minutes
        end

        # Most APs attributes won't change often, so only update if any change is detected
        diff = different_values(ap, cached_obj.except("id", "created_at", "updated_at"))
        if diff.present?
          MobileScannedAccessPoint.find(cached_obj["id"]).update!(**diff)
        end

        # Register the signal measurement
        MobileScannedAccessPoint.register_measurement(cached_obj["id"], ap.level, message.scan_result.latitude, message.scan_result.longitude, Time.at(ap.timestamp.seconds, ap.timestamp.nanos, :nanosecond))

      end
    end
  end

  private

  def different_values(ap, cached_obj)
    # return a hash with all values that changed
    cached_obj.each_with_object({}) do |(k, v), h|
      h[k] = ap[k] if ap[k].to_s != v
    end
  end
end
