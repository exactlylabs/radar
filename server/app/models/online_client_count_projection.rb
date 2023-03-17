class OnlineClientCountProjection < ApplicationRecord
  belongs_to :account, foreign_key: true, optional: true
  belongs_to :autonomous_system, foreign_key: true, optional: true
  belongs_to :location, foreign_key: true, optional: true

  def self.aggregate!()
    # Consumes from the event stream from the last offset
    consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "OnlineClientCountProjection")
    events = Event.where(
        "id > ? AND aggregate_type IN ('Client')", 
        consumer_offset.offset
    ).order('timestamp ASC, version ASC')

    events.each do |event|
      
        OnlineClientCountProjection.transaction do 
          begin
            self.handle_client_event! event
          rescue ActiveRecord::InvalidForeignKey
          end
        end
      consumer_offset.offset = event.id
      consumer_offset.save!
    end
    return nil
  end

  def self.handle_client_event!(event)
    state = event.snapshot.state
    
    last_count = self.latest_for state["account_id"], state["autonomous_system_id"], state["location_id"]
    if last_count.nil?
      last_count = OnlineClientCountProjection.new(
        account_id: state["account_id"], 
        autonomous_system_id: state["autonomous_system_id"], 
        location_id: state["location_id"]
      )
    end
    case event.name
    when Client::Events::CREATED
      if state["online"]
        self.new_record!(last_count, event, increment=1)
      end
    
    when Client::Events::ACCOUNT_CHANGED
      if state["online"]
        old_account_count = self.latest_for event.data["from"], state["autonomous_system_id"], state["location_id"]
        self.new_record!(last_count, event, increment=1)
        if old_account_count.present?
          self.new_record!(old_account_count, event, increment=-1)
        end
      end
      
    when Client::Events::LOCATION_CHANGED
      if state["online"]
        old_location_count = self.latest_for state["account_id"], state["autonomous_system_id"], event.data["from"]
        self.new_record!(last_count, event, increment=1)
        if old_location_count.present?
          self.new_record!(old_location_count, event, increment=-1)
        end
      end

    when Client::Events::AS_CHANGED
      if state["online"]
        old_as_count = self.latest_for state["account_id"], event.data["from"], state["location_id"]
        self.new_record!(last_count, event, increment=1)
        if old_as_count.present?
          self.new_record!(old_as_count, event, increment=-1)
        end
      end

    when Client::Events::WENT_ONLINE
      self.new_record!(last_count, event, increment=1)

    when Client::Events::WENT_OFFLINE
      self.new_record!(last_count, event, increment=-1)
    end
  end

  def self.latest_for(account_id, as_id, location_id)
    self.where(account_id: account_id, autonomous_system_id: as_id, location_id: location_id).last
  end

  private

  def self.new_record!(previous_count, event, increment=0)
    count = OnlineClientCountProjection.new(previous_count.as_json)
    count.id = nil # to ensure it creates a new row, instead of updating the existing
    count.timestamp = event.timestamp
    count.event_id = event.id
    count.online += increment
    count.save!
  end
end
