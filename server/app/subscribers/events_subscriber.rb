class EventsSubscriber

  ###
  #
  # Register a subscription to an event from our EventSourceable module
  #
  # Example:
  # class Subscriber
  #  def self.call
  #    subscribe(Client, ["WENT_ONLINE"]) do |event|
  #        # Do something with Event model class.
  #    end
  #  end
  # end
  def self.subscribe(aggregate_class, to, &block)
    to = [to] unless to.is_a?(Array)
    to.each do |event_name|
      event_name = "#{aggregate_class.name}::#{event_name}"
      ActiveSupport::Notifications.subscribe(event_name) do |name, started, finished, unique_id, data|
        block.call(data[:payload])
      end
    end
  end
end
