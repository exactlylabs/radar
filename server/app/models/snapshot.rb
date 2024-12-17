class Snapshot < ApplicationRecord
  belongs_to :event
  belongs_to :aggregate, polymorphic: true

  default_scope { joins(:event).order("timestamp ASC, version ASC") }

  # Some scopes below when filtered by the aggregate, we prefer filtering by the event's aggregate.
  # This is a performance optimization, as we usually also filter Snapshot by time, and so it's preferable
  # to do all filters in the same table, hence the Event table.
  scope :of, ->(model) { joins(:event).where(event: {aggregate_type: model.name}) }
  scope :from_aggregate, -> (obj) { joins(:event).where(event: {aggregate: obj})}
  scope :ordered_by_event, -> { joins(:event).order("timestamp ASC, version ASC") }
  scope :prior_to_or_at, ->(timestamp) { joins(:event).where("timestamp <= ?", timestamp) }
  scope :prior_to, ->(timestamp) { joins(:event).where("timestamp < ?", timestamp) }


  def self.reprocess_for_model_since(model, since)
    cached_snapshot = {}
    start_time = Time.now
    chunks = 10_000
    Rails.logger.info("Reprocessing events since #{since} in chunks of #{chunks}")
    events = Event.of(model)
    if since.present?
      events = events.where("timestamp > ?", since)
    end
    total_rows = 0
    Snapshot.transaction do
      ar_conn = ActiveRecord::Base.connection_pool.checkout
      begin
        conn = ar_conn.raw_connection
        conn.send_query(events.order(:timestamp => :asc, :version => :asc).to_sql)
        conn.set_single_row_mode

        conn.get_result.stream_each do |event|
          total_rows += 1
          since = event["timestamp"]
          begin
            aggregate = event["aggregate_type"].constantize.unscoped.find(event["aggregate_id"])
          rescue ActiveRecord::RecordNotFound
            next
          end
          config = aggregate._config

          if event["name"] == "CREATED"
            applier = config[:on_create][:applier]
          elsif event["name"] == "DELETED"
            applier = config[:on_destroy][:applier]

          else
            applier = config[:observed_fields].find { |x| (x[:event].is_a?(Hash) && x[:event].has_value?(event["name"])) || x[:event] == event["name"] }&.[](:applier)
          end

          last_snap = cached_snapshot[aggregate]
          if last_snap.nil? || last_snap.event.timestamp > event["timestamp"]
            last_snap = Snapshot.preload(:event).from_aggregate(aggregate).prior_to_or_at(event["timestamp"]).where.not(event_id: event["id"]).ordered_by_event.last
          end
          state = last_snap&.state || {}
          event["data"] = JSON.parse(event["data"]).with_indifferent_access
          aggregate.send(applier, state, Event.new(event)) if applier.present?
          snapshot = Snapshot.find_by(event_id: event["id"])
          if snapshot.present?
            snapshot.update_column(:state, state)
          else
            snapshot = Snapshot.create aggregate: aggregate, event_id: event["id"], state: state
          end
          cached_snapshot[aggregate] = snapshot
        end
      ensure
        ActiveRecord::Base.connection_pool.checkin(ar_conn)
      end
    end
    Rails.logger.info("Finished reprocessing Snapshots since #{since} in #{Time.now - start_time}. With a total of #{total_rows} events processed")
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
          last_snap = cached_snapshot[aggregate] || Snapshot.from_aggregate(aggregate).prior_to_or_at(event.timestamp).ordered_by_event.last
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
