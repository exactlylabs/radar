module ApplicationCable
  class MobileCoder
    # MobileCoder transforms ActionCable messages into encoded binary format and converted to a byte array.
    # The bytearray conversion was necessary to make it use a binary frame in the WebSocket protocol.

    def self.encode(data)
      case data[:type]
      when 'welcome'
        msg = WsMobileMessagesPb::WSMessage.new(event: WsMobileMessagesPb::Events::WELCOME)
      when 'ping'
        msg = WsMobileMessagesPb::WSMessage.new(event: WsMobileMessagesPb::Events::PING, timestamp: Time.at(data[:message]))
      else
        msg = WsMobileMessagesPb::WSMessage.new(event: WsMobileMessagesPb::Events::Other, json: data[:message].as_json)
      end
      WsMobileMessagesPb::WSMessage.encode(msg).bytes
    end

    def self.decode(data)
      if data.is_a? Array
        WsMobileMessagesPb::WSMessage.decode(data.pack('C*'))
      else
        WsMobileMessagesPb::WSMessage.decode(data)
      end
    end
  end
end
