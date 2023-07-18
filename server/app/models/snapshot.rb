class Snapshot < ApplicationRecord
  belongs_to :event
  belongs_to :aggregate, polymorphic: true

  scope :of, ->(model) { where(aggregate_type: model.name) }
  scope :from_aggregate, -> (obj) { where(aggregate: obj)}
  scope :prior_to_or_at, ->(timestamp) { joins(:event).where("timestamp <= ?", timestamp) }
  scope :prior_to, ->(timestamp) { joins(:event).where("timestamp < ?", timestamp) }

  def self.last_from(aggregate)
    Snapshot.where(aggregate: aggregate).order("snapshots.aggregate_id, created_at DESC").first
  end

  def self.reprocess_since(since)
    Event.where("timestamp >= ?", since).order("timestamp ASC").each do |event|
      begin
        aggregate = event.aggregate_type.constantize.unscoped.find(event.aggregate_id)
      rescue ActiveRecord::RecordNotFound
        next
      end
      config = aggregate._config

      if event.name == "CREATED"
        applier = config[:on_create][:applier]
      elsif event.name == "DELETED"
        applier = config[:on_destroy][:applier]

      else
        applier = config[:observed_fields].find { |x| (x[:event].is_a?(Hash) && x[:event].has_value?(event.name)) || x[:event] == event.name }&.[](:applier)
      end

      last_snap = Snapshot.from_aggregate(aggregate).prior_to(event.timestamp).last
      state = last_snap&.state || {}

      aggregate.send(applier, state, event) if applier.present?

      if event.snapshot.present?
        event.snapshot.update(state: state)
      else
        Snapshot.create aggregate: aggregate, event: event, state: state
      end
    end
    return nil
  end

end
