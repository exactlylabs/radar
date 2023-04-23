class IspOutage < ApplicationRecord
  include EventSourceable

  module Events
    CREATED = "CREATED"
    FINISHED = "FINISHED"
  end

  notify_change :end_time, Events::FINISHED
  
  belongs_to :autonomous_system
  
  scope :where_active, -> { where("end_time IS NULL") }
  scope :where_intersects, -> (start_time, end_time) { where("start_time >= ? AND start_time <= ?", start_time, end_time) }

  def send_created_event
    super
    # Cover the case when an outage is created with an end_time already set (retroactive outage)
    if self.end_time.present?
      send_field_changed_event(:end_time, nil, self.end_time, self.end_time)
    end
  end

end