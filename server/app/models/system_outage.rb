class SystemOutage < ApplicationRecord
  include EventSourceable

  module Events
    CREATED = "CREATED"
    FINISHED = "FINISHED"
    UPDATED = "UPDATED"
  end

  notify_change :start_time, Events::UPDATED
  notify_change :end_time, Events::FINISHED

  scope :where_active, -> { where("end_time IS NULL") }
  scope :at, -> (timestamp) { where("start_time <= ? AND (end_time IS NULL OR end_time > ?)", timestamp, timestamp)}

  def send_created_event
    super
    # Cover the case when an outage is created with an end_time already set (retroactive outage)
    if self.end_time.present?
      send_field_changed_event(:end_time, nil, self.end_time, self.end_time)
    end
  end

  def get_event_timestamp(event_name, timestamp)
    case when event_name == Events::CREATED
      self.start_time
    when event_name == Events::FINISHED
      self.end_time
    else
      timestamp
    end
  end

end
