class WatchdogPubChannel < ApplicationCable::Channel
  # Channel dedicated to provide info on watchdog updates, without exposing the commands part

  def subscribed
    stream_for CHANNELS[:watchdog_pub]
  end
end
