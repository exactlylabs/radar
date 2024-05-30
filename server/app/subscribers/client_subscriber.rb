class ClientSubscriber < EventsSubscriber
  def self.call
    subscribe(Client, [Client::Events::WENT_ONLINE, Client::Events::WENT_OFFLINE]) do |event|
      # NOOP for now.
    end
  end
end
