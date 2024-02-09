class OnlineClientCountHandler
  MAX_QUEUE_SIZE = 50000
  DEFAULT_BATCH_SIZE = 10000

  def initialize()
    @consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "OnlineClientCountProjection")
    @insertion_queue = []

    # Cached data to avoid repeated DB queries
    @last_projections = {}
    @locations = {}
    @last_client_event = {}
    @ongoing_system_outage = nil
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
    events = self.to_be_processed_events
    events.each do |event|
      next if self.is_duplicated_event(event)
      @ongoing_system_outage = SystemOutage.at(event.timestamp).exists? if @ongoing_system_outage.nil?
      begin
        if event.aggregate_type == Client.name
          self.handle_client_event! event
        elsif event.aggregate_type == SystemOutage.name
          self.handle_system_outage_event! event
        elsif event.aggregate_type == Location.name
          self.handle_location_event! event
        end
      rescue ActiveRecord::InvalidForeignKey
      end
      @consumer_offset.offset = event.id
      if @insertion_queue.length > MAX_QUEUE_SIZE
        self.flush_insertion_queue
      end
    end
    self.flush_insertion_queue
    return nil
  end

  def handle_client_event!(event)
    if event.snapshot.nil? || @ongoing_system_outage
      return
    end
    state = event.snapshot.state
    last_count = last_projection(state["account_id"], state["autonomous_system_id"], state["location_id"])
    case event.name
    when Client::Events::CREATED
      if state["online"]
        self.new_record!(last_count, event, increment=1)
      end

    when Client::Events::ACCOUNT_CHANGED
      if state["online"]
        old_account_count = self.last_projection(event.data["from"], state["autonomous_system_id"], state["location_id"])
        self.new_record!(last_count, event, increment=1)
        if old_account_count.present?
          self.new_record!(old_account_count, event, increment=-1)
        end
      end

    when Client::Events::LOCATION_CHANGED
      if state["online"]
        old_location_count = self.last_projection(state["account_id"], state["autonomous_system_id"], event.data["from"])
        self.new_record!(last_count, event, increment=1)
        if old_location_count.present?
          self.new_record!(old_location_count, event, increment=-1)
        end
      end

    when Client::Events::AS_CHANGED
      if state["online"]
        old_as_count = self.last_projection(state["account_id"], event.data["from"], state["location_id"])
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

  def handle_system_outage_event!(event)
    if event.name == SystemOutage::Events::CREATED
      @ongoing_system_outage = true
    elsif event.name == SystemOutage::Events::FINISHED
      @ongoing_system_outage = false
      outage = event.snapshot.state
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
    if event.name == Location::Events::DATA_MIGRATION_REQUESTED
      OnlineClientCountProjection.where(
        location_id: event.aggregate_id, account_id: event.data["from"]
      ).update_all(account_id: event.data["to"])
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

  def push_to_queue(event, account_id, autonomous_system_id, location_id, online, total, total_in_service, incr)
    return unless self.location_valid?(location_id)
    @insertion_queue.push({
      "timestamp" => event.timestamp,
      "account_id" => account_id,
      "autonomous_system_id" => autonomous_system_id,
      "location_id" => location_id,
      "online" => online,
      "total" => total,
      "total_in_service" => total_in_service,
      "event_id" => event.id,
      "incr" => incr
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
    count.id = nil # to ensure it creates a new row, instead of updating the existing
    count.timestamp = event.timestamp
    count.event_id = event.id
    count.online += increment
    count.incr = increment
    self.push_to_queue(event, count.account_id, count.autonomous_system_id, count.location_id, count.online, count.total, count.total_in_service, increment)
    @last_projections["#{count.account_id}-#{count.autonomous_system_id}-#{count.location_id}"] = count
  end

  def last_event_for(client, timestamp)
    @last_client_event[client.id] ||= Event.from_aggregate(client).prior_to(timestamp).last
    @last_client_event[client.id]
  end

  def to_be_processed_events(**opts)
    batch_size = opts[:batch_size] || DEFAULT_BATCH_SIZE
    Enumerator.new { |g|
      events = Event.where(
          "id > ? AND (aggregate_type = ? OR aggregate_type = ? OR aggregate_type = ?)",
          @consumer_offset.offset, Client.name, SystemOutage.name, Location.name
      ).order('timestamp ASC, version ASC').preload(:snapshot, :aggregate).find_each(batch_size: batch_size) do |event|
        g.yield event
        @last_client_event[event.aggregate_id] = event if event.aggregate_type == Client.name
      end
    }
  end

  def is_duplicated_event(event)
    if event.aggregate_type != Client.name || ![Client::Events::WENT_ONLINE, Client::Events::WENT_OFFLINE].include?(event.name)
      return false
    end
    return last_event_for(event.aggregate, event.timestamp)&.name == event.name
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
        COPY online_client_count_projections (timestamp, account_id, autonomous_system_id, location_id, online, total, total_in_service, event_id, incr)
        FROM STDIN CSV
      })
      @insertion_queue.each do |row|
        @raw.put_copy_data(
          "#{row['timestamp']},#{row['account_id']},#{row['autonomous_system_id']},#{row['location_id']},#{row['online']},#{row['total']},#{row['total_in_service']},#{row['event_id']},#{row['incr']}\n")
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

end
