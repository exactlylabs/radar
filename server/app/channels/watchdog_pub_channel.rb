class WatchdogPubChannel < ApplicationCable::Channel
  # Channel dedicated to provide info on watchdog updates, without exposing the commands part

  def subscribed
    @client = Client.find(params[:id])
    stream_for @client
  end

  def receive(data)
    if data["action"] == "scan_wifi"
      WatchdogChannel.broadcast_wireless_scan_requested(@client)
    end
  end

  def scan_wifi(data)
    WatchdogChannel.broadcast_wireless_scan_requested(@client)
  end
end
