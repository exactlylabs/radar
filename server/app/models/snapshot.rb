class Snapshot < ApplicationRecord
  belongs_to :event
  belongs_to :aggregate, polymorphic: true

  default_scope { joins(:event).order("events.timestamp ASC") }

  scope :of, ->(model) { where(aggregate_type: model.name) }
  scope :from_aggregate, -> (obj) { where(aggregate: obj)}
  scope :ordered_by_event, -> { joins(:event).order("events.timestamp ASC") }
  scope :prior_to_or_at, ->(timestamp) { joins(:event).where("timestamp <= ?", timestamp) }
  scope :prior_to, ->(timestamp) { joins(:event).where("timestamp < ?", timestamp) }

  def self.last_from(aggregate)
    Snapshot.where(aggregate: aggregate).order("snapshots.aggregate_id, created_at DESC").first
  end

  def self.reprocess_for_model_since(model, since)
    cached_snapshot = {}
    start_time = Time.now
    chunks = 10_000
    Rails.logger.info("Reprocessing events since #{since} in chunks of #{chunks}")
    events = Event.of(model)
    if since.present?
      events = events.where("timestamp > ?", since)
    end
    events.order("timestamp ASC").find_in_batches(batch_size: chunks).each do |batch|
      Snapshot.transaction do
        batch.each do |event|
          since = event.timestamp
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
          last_snap = cached_snapshot[aggregate] || Snapshot.from_aggregate(aggregate).prior_to(event.timestamp).last
          state = last_snap&.state || {}

          aggregate.send(applier, state, event) if applier.present?

          if event.snapshot.present?
            event.snapshot.update_column(:state, state)
            snapshot = event.snapshot
          else
            snapshot = Snapshot.create aggregate: aggregate, event: event, state: state
          end
          cached_snapshot[aggregate] = snapshot
        end
        Rails.logger.info("finishing transaction block")
      end
      Rails.logger.info("transaction completed")
    end
    Rails.logger.info("Finished reprocessing Snapshots since #{since} in #{Time.now - start_time}")
    return nil
  end

  def self.reprocess_since(since)
    cached_snapshot = {}
    start_time = Time.now
    chunks = 10_000
    Rails.logger.info("Reprocessing events since #{since} in chunks of #{chunks}")
    events = Event
    if since.present?
      events = events.where("timestamp > ?", since)
    end
    events.order("timestamp ASC").find_in_batches(batch_size: chunks).each do |batch|
      Snapshot.transaction do
        batch.each do |event|
          since = event.timestamp
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
          last_snap = cached_snapshot[aggregate] || Snapshot.from_aggregate(aggregate).prior_to(event.timestamp).ordered_by_event.last
          state = last_snap&.state || {}

          aggregate.send(applier, state, event) if applier.present?

          if event.snapshot.present?
            event.snapshot.update_column(:state, state)
            snapshot = event.snapshot
          else
            snapshot = Snapshot.create aggregate: aggregate, event: event, state: state
          end
          cached_snapshot[aggregate] = snapshot
        end
        Rails.logger.info("finishing transaction block")
      end
      Rails.logger.info("transaction completed")
    end
    Rails.logger.info("Finished reprocessing Snapshots since #{since} in #{Time.now - start_time}")
    return nil
  end

end
