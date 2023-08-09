class OnlineClientCountProjection < ApplicationRecord
  belongs_to :account, foreign_key: true, optional: true
  belongs_to :autonomous_system, foreign_key: true, optional: true
  belongs_to :location, foreign_key: true, optional: true

  def self.aggregate!()
    # Consumes from the event stream from the last offset
    consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "OnlineClientCountProjection")
    events = Event.where(
        "id > ? AND (aggregate_type = ? OR aggregate_type = ? OR aggregate_type = ?)",
        consumer_offset.offset, Client.name, SystemOutage.name, Location.name
    ).order('timestamp ASC, version ASC')

    events.each do |event|

        OnlineClientCountProjection.transaction do
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
        end
      consumer_offset.offset = event.id
      consumer_offset.save!
    end
    return nil
  end

  def self.handle_client_event!(event)
    if event.snapshot.nil? || SystemOutage.at(event.timestamp).exists?
      return
    end
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

  def self.handle_system_outage_event!(event)
    if event.name == SystemOutage::Events::FINISHED
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
          old_count = self.latest_for record["from_account_id"], record["from_autonomous_system_id"], record["from_location_id"]
          self.new_record!(old_count, event, increment=-1)
        end
        if record["to_online"]
          new_count = self.latest_for record["to_account_id"], record["to_autonomous_system_id"], record["to_location_id"]
          self.new_record!(new_count, event, increment=1)
        end
      end
    end
  end

  def self.handle_location_event!(event)
    if event.name == Location::Events::DATA_MIGRATION_REQUESTED
      OnlineClientCountProjection.where(
        location_id: event.aggregate_id, account_id: event.data["from"]
      ).update_all(account_id: event.data["to"])
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
    count.incr = increment
    count.save!
  end
end
