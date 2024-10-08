class OnlineClientCountHandler
  include Fetchers

  MAX_QUEUE_SIZE = 50000
  DEFAULT_BATCH_SIZE = 10000

  def initialize()
    @consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "OnlineClientCountProjection")
    @insertion_queue = []

    # Cached data to avoid repeated DB queries
    @last_projections = {}
    @locations = {}
    @pods_status = {}
    @last_clients_events = {}
    @ongoing_system_outage = nil
    @last_timestamp = nil
  end

  def self.clear
    ActiveRecord::Base.connection.transaction do
      ActiveRecord::Base.connection.execute("TRUNCATE TABLE online_client_count_projections")
      ConsumerOffset.find_by(consumer_id: "OnlineClientCountProjection")&.destroy
    end
  end

  def aggregate!()
    conn = ActiveRecord::Base.connection_pool.checkout
    begin
      @raw = conn.raw_connection
      self._aggregate!
    ensure
      ActiveRecord::Base.connection_pool.checkin(conn)
    end
  end

  def _aggregate!()
    @last_timestamp = OnlineClientCountProjection.order(timestamp: :desc).first&.timestamp
    offsets = {
      client_events_timestamp: @consumer_offset.state["client_events_timestamp"] || 0,
      location_events_timestamp: @consumer_offset.state["location_events_timestamp"] || 0,
      sys_outage_events_offset: @consumer_offset.state["sys_outage_events_offset"] || 0,
    }
    iterators = [
      self.events_iterator(Client, offsets[:client_events_timestamp], filter_timestamp: true),
      self.events_iterator(Location, offsets[:location_events_timestamp], filter_timestamp: true),
      self.events_iterator(SystemOutage, offsets[:sys_outage_events_offset]),
    ]

    self.sorted_iteration(iterators).each do |content|
      event = content[:data]

      @ongoing_system_outage = SystemOutage.at(event["timestamp"]).exists? if @ongoing_system_outage.nil?
      begin
        if event["aggregate_type"] == Client.name
          self.handle_client_event! event
          @consumer_offset.state["client_events_timestamp"] = event["timestamp"].to_f
        elsif event["aggregate_type"] == SystemOutage.name
          self.handle_system_outage_event! event
          @consumer_offset.state["sys_outage_events_offset"] = event["id"]
        elsif event["aggregate_type"] == Location.name
          self.handle_location_event! event
          @consumer_offset.state["location_events_timestamp"] = event["timestamp"].to_f
        end
      rescue ActiveRecord::InvalidForeignKey
      end
      if @insertion_queue.length > MAX_QUEUE_SIZE
        self.flush_insertion_queue
      end
      @last_timestamp = event["timestamp"]
    end
    self.flush_insertion_queue
    return nil
  end

  def handle_client_event!(event)
    return if event["snapshot_id"].nil?
    aggregate_id = event["aggregate_id"]
    self.with_previous_pod_state(event["snapshot_state"], aggregate_id, event["timestamp"]) do |previous_state, state|
      online_changed = state["online"] != previous_state&.fetch("online", false)
      account_changed = state["account_id"] != previous_state&.fetch("account_id", nil)
      location_changed = state["location_id"] != previous_state&.fetch("location_id", nil)
      as_changed = state["autonomous_system_id"] != previous_state&.fetch("autonomous_system_id", nil)
      current_dimension = last_projection(state["account_id"], state["autonomous_system_id"], state["location_id"])
      if (location_changed || as_changed || account_changed) && state["online"]
        self.new_record!(current_dimension, event, increment=1)
        if previous_state.present?
          previous_dimension = last_projection(previous_state["account_id"], previous_state["autonomous_system_id"], previous_state["location_id"])
          self.new_record!(previous_dimension, event, increment=-1)
        end

      elsif online_changed
        if state["online"]
          self.new_record!(current_dimension, event, increment=1)
        elsif previous_state.present?
          self.new_record!(current_dimension, event, increment=-1)
        end
      end
    end
  end

  def handle_system_outage_event!(event)
    if event["name"] == SystemOutage::Events::FINISHED
      outage = event["snapshot_state"]

      # Add any pending record from the queue into the DB, to work on DB data only, not both DB and queue.
      self.flush_insertion_queue

      # Update all projections from the beginning of the outage until the end with the value at the beginning.
      sql = %{
        WITH projections_before_outage AS (
          SELECT
            DISTINCT ON (p.account_id, p.autonomous_system_id, p.location_id) account_id, autonomous_system_id, location_id,
            p.online,
            p.total,
            p.total_in_service,
            p.timestamp,
            p.incr
          FROM online_client_count_projections p
          WHERE
            p.timestamp < :start_time
          ORDER BY account_id, autonomous_system_id, location_id, timestamp DESC
        )

        UPDATE
          online_client_count_projections p
        SET
          online = pbo.online,
          total = pbo.total,
          total_in_service = pbo.total_in_service,
          incr = 0
        FROM projections_before_outage pbo
        WHERE
          p.timestamp BETWEEN :start_time AND :end_time AND
          pbo.account_id = p.account_id AND
          pbo.autonomous_system_id = p.autonomous_system_id AND
          pbo.location_id = p.location_id
      }
      ActiveRecord::Base.connection.execute(
        ApplicationRecord.sanitize_sql(
          [sql, {
             start_time: outage["start_time"],
             end_time: outage["end_time"],
          }]
        )
      )

      # Once a system outage is finished, we search for
      # pods whose state differs from the state before the outage.
      sql = %{
        WITH state_before_outage AS (
          SELECT
            DISTINCT ON (snapshots.aggregate_id) snapshots.aggregate_id,
            (state->>'online')::boolean as online,
            (state->>'account_id')::bigint as account_id,
            (state->>'location_id')::bigint as location_id,
            (state->>'autonomous_system_id')::bigint as autonomous_system_id
          FROM snapshots
          JOIN events ON snapshots.event_id = events.id
          WHERE snapshots.aggregate_type = :client_aggregate_type
          AND timestamp < :start_time
          ORDER BY snapshots.aggregate_id, timestamp DESC
        ), state_right_before_ending AS (
          SELECT
            DISTINCT ON (snapshots.aggregate_id) snapshots.aggregate_id,
            (state->>'online')::boolean as online,
            (state->>'account_id')::bigint as account_id,
            (state->>'location_id')::bigint as location_id,
            (state->>'autonomous_system_id')::bigint as autonomous_system_id
          FROM snapshots
          JOIN events ON snapshots.event_id = events.id
          WHERE snapshots.aggregate_type = :client_aggregate_type
          AND timestamp < :end_time
          ORDER BY snapshots.aggregate_id, timestamp DESC
        )

        SELECT
          f.online as from_online,
          f.account_id as from_account_id,
          f.location_id as from_location_id,
          f.autonomous_system_id as from_autonomous_system_id,
          t.online as to_online,
          t.account_id as to_account_id,
          t.location_id as to_location_id,
          t.autonomous_system_id as to_autonomous_system_id

        FROM state_before_outage f
        RIGHT JOIN state_right_before_ending t ON f.aggregate_id = t.aggregate_id
        WHERE f.online != t.online
      }
      records = ActiveRecord::Base.connection.execute(
        ApplicationRecord.sanitize_sql(
          [sql, {
             start_time: outage["start_time"],
             end_time: outage["end_time"],
             client_aggregate_type: Client.name
          }]
        )
      )
      records.each do |record|
        if record["from_online"]
          old_count = OnlineClientCountProjection.latest_for record["from_account_id"], record["from_autonomous_system_id"], record["from_location_id"]
          self.new_record!(old_count, event, increment=-1)
        end
        if record["to_online"]
          new_count = OnlineClientCountProjection.latest_for record["to_account_id"], record["to_autonomous_system_id"], record["to_location_id"]
          self.new_record!(new_count, event, increment=1)
        end
      end
    end
  end

  def handle_location_event!(event)
    if event["name"] == Location::Events::DATA_MIGRATION_REQUESTED
      OnlineClientCountProjection.where(
        location_id: event["aggregate_id"], account_id: event["data"]["from"]
      ).update_all(account_id: event["data"]["to"])
    end
  end

  private

  def location_valid?(location_id)
    return true if location_id.nil?
    begin
      @locations[location_id] ||= Location.unscoped.find(location_id)
    rescue ActiveRecord::RecordNotFound
      return false
    end
    return @locations[location_id].present?
  end

  def push_to_queue(event, account_id, autonomous_system_id, location_id, online, total, total_in_service, incr, is_online, location_online_incr)
    return unless self.location_valid?(location_id)
    @insertion_queue.push({
      "timestamp" => event["timestamp"],
      "account_id" => account_id,
      "autonomous_system_id" => autonomous_system_id,
      "location_id" => location_id,
      "online" => online,
      "total" => total,
      "total_in_service" => total_in_service,
      "event_id" => event["id"],
      "incr" => incr,
      "is_online" => is_online,
      "location_online_incr" => location_online_incr
    })
  end

  def last_projection(account_id, autonomous_system_id, location_id)
    # Return the last projection for given parameters set.
    #  It first tries to localize an already loaded object in memory otherwise it queries the DB and caches the result.
    key = "#{account_id}-#{autonomous_system_id}-#{location_id}"
    @last_projections[key] ||= OnlineClientCountProjection.latest_for account_id, autonomous_system_id, location_id
    if @last_projections[key].nil?
      @last_projections[key] = OnlineClientCountProjection.new(
        account_id: account_id,
        autonomous_system_id: autonomous_system_id,
        location_id: location_id
      )
    end
    return @last_projections[key]
  end

  def new_record!(previous_count, event, increment=0)
    count = OnlineClientCountProjection.new(previous_count.as_json)
    return unless count.account_id.present?
    count.id = nil # to ensure it creates a new row, instead of updating the existing
    count.timestamp = event["timestamp"]
    count.event_id = event["id"]
    count.online += increment
    count.incr = increment
    count.is_online = count.online > 0 unless count.location_id.nil?
    count.location_online_incr = 0
    if count.location_id.present? && count.is_online ^ previous_count.is_online
      count.location_online_incr = count.is_online? ? 1 : -1
    end
    self.push_to_queue(event, count.account_id, count.autonomous_system_id, count.location_id, count.online, count.total, count.total_in_service, increment, count.is_online, count.location_online_incr)
    @last_projections["#{count.account_id}-#{count.autonomous_system_id}-#{count.location_id}"] = count
  end

  def pod_was_online?(aggregate_type, aggregate_id, timestamp)
    if @pods_status[aggregate_id].nil?
      snap = Snapshot.where(aggregate_type: aggregate_type, aggregate_id: aggregate_id).prior_to(timestamp).ordered_by_event.last
      @pods_status[aggregate_id] = snap&.state&.fetch("online") || false
    end
    @pods_status[aggregate_id]
  end

  def to_be_processed_events(**opts)
    batch_size = opts[:batch_size] || DEFAULT_BATCH_SIZE
    Enumerator.new { |g|
      events = Event.where(
          "id > ? AND (aggregate_type = ? OR aggregate_type = ? OR aggregate_type = ?)",
          @consumer_offset.offset, Client.name, SystemOutage.name, Location.name
      ).order('timestamp ASC, version ASC').preload(:snapshot, :aggregate).find_each(batch_size: batch_size) do |event|
        g.yield event
      end
    }
  end

  def flush_insertion_queue
    if @insertion_queue.empty?
      return
    end
    @raw.transaction do
      Rails.logger.info "Flushing insertion queue with #{@insertion_queue.length} records"
      t = Time.now
      @consumer_offset.save!
      @raw.exec(%{
        COPY online_client_count_projections (timestamp, account_id, autonomous_system_id, location_id, online, total, total_in_service, event_id, incr, is_online, location_online_incr)
        FROM STDIN CSV
      })
      @insertion_queue.each do |row|
        @raw.put_copy_data(
          "#{row['timestamp']},#{row['account_id']},#{row['autonomous_system_id']},#{row['location_id']},#{row['online']},#{row['total']},#{row['total_in_service']},#{row['event_id']},#{row['incr']},#{row['is_online']},#{row['location_online_incr']}\n")
      end
      @raw.put_copy_end
      while res = @raw.get_result do
        if res.result_status != 1
          raise res.error_message
        end
      end
      Rails.logger.info "Insertion took #{Time.now - t} seconds"
    end
    @insertion_queue = []
  end

  # Compare states with a caching mechanism to avoid duplicated queries
  def with_previous_pod_state(current_state, aggregate_id, timestamp)
    @pod_state ||= {}
    if @pod_state[aggregate_id].nil?
      previous_event = Event.of(Client).where(aggregate_id: aggregate_id).where("timestamp < ?", timestamp).order(:timestamp => :asc, :version => :asc).last
      @pod_state[aggregate_id] = previous_event&.snapshot&.state
    end
    yield @pod_state[aggregate_id], current_state

    @pod_state[aggregate_id] = current_state
  end

end
