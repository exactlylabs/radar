class PodStatusChannel < ApplicationCable::Channel
  # Called when the consumer has successfully
  # become a subscriber to this channel.
  def subscribed
    stream_for CHANNELS[:clients_status]
  end
end