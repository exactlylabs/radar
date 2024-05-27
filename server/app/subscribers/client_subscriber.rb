class ClientSubscriber < EventsSubscriber

  subscribe(Client, [Client::Events::WENT_ONLINE, Client::Events::WENT_OFFLINE]) do |event|
    # Call job to notify users that own this pod and are signed for receiving this notification
    NotifyClientStatusChangeJob.perform_later(event.aggregate, event.data["to"])
  end
end
