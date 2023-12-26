class NotificationsChannel < ApplicationCable::Channel
  # Called when the consumer has successfully
  # become a subscriber to this channel.
  def subscribed
    stream_for "notifications_channel_#{params[:user_email]}"
  end
end