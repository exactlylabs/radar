module Fetchers
  DEFAULT_BATCH_SIZE = 10000

  def events_iterator(model, offset, batch_size: DEFAULT_BATCH_SIZE)
    Enumerator.new { |g|
      ar_conn = ActiveRecord::Base::connection_pool.checkout
      begin
        conn = ar_conn.raw_connection
        sql = %{
          SELECT
            events.id as id,
            events.name as name,
            events.data as data,
            events.timestamp as timestamp,
            events.aggregate_type as aggregate_type,
            events.aggregate_id as aggregate_id,
            snapshots.state as snapshot_state,
            snapshots.id as snapshot_id
          FROM events
          JOIN snapshots ON snapshots.event_id = events.id
          WHERE events.id > ? AND events.aggregate_type = ?
          ORDER BY events.timestamp ASC, events.version ASC
        }
        sql = ActiveRecord::Base.sanitize_sql_array([sql, offset, model.name])
        conn.send_query(sql)
        conn.set_single_row_mode
        conn.get_result.stream_each do |event|
          event["snapshot_state"] = JSON.parse(event["snapshot_state"]).with_indifferent_access
          event["data"] = JSON.parse(event["data"]).with_indifferent_access
          g.yield ({name: model.name, data: event, timestamp: event["timestamp"].to_i})
        end
      ensure
        ActiveRecord::Base::connection_pool.checkin(ar_conn)
      end
    }
  end

  def measurements_iterator(offset, batch_size: DEFAULT_BATCH_SIZE)
    Enumerator.new { |g|
      sql = Measurement.joins(:autonomous_system => [:autonomous_system_org]).where(
        "processed = true AND measurements.id > ? AND lonlat IS NOT NULL AND location_id IS NOT NULL",
        offset
      ).order(
        "processed_at ASC, measurements.id ASC"
      ).select(%{
        measurements.id as id,
        measurements.location_id as location_id,
        measurements.lonlat as lonlat,
        ST_X(measurements.lonlat::geometry) as longitude,
        ST_Y(measurements.lonlat::geometry) as latitude,
        measurements.processed_at as processed_at,
        autonomous_system_orgs.id as autonomous_system_org_id,
        autonomous_system_orgs.name as autonomous_system_org_name
      }).to_sql
      ar_conn = ActiveRecord::Base::connection_pool.checkout
      begin
        conn = ar_conn.raw_connection
        conn.send_query(sql)
        conn.set_single_row_mode
        conn.get_result.stream_each do |measurement|
            g.yield ({name: "Measurements", data: measurement, timestamp: measurement["processed_at"].to_i})
        end
      ensure
        ActiveRecord::Base::connection_pool.checkin(ar_conn)
      end
    }
  end

  def client_speed_tests_iterator(offset, batch_size: DEFAULT_BATCH_SIZE)
    speed_tests = ClientSpeedTest.joins(:autonomous_system => [:autonomous_system_org]).where(
      "processed_at IS NOT NULL AND client_speed_tests.id > ? AND lonlat IS NOT NULL",
      offset
    ).order("processed_at ASC, client_speed_tests.id ASC").select(%{
      client_speed_tests.id as id,
      client_speed_tests.lonlat as lonlat,
      ST_X(client_speed_tests.lonlat::geometry) as longitude,
      ST_Y(client_speed_tests.lonlat::geometry) as latitude,
      client_speed_tests.processed_at as processed_at,
      autonomous_system_orgs.id as autonomous_system_org_id,
      autonomous_system_orgs.name as autonomous_system_org_name
    }).to_sql
    Enumerator.new { |g|
      ar_conn = ActiveRecord::Base::connection_pool.checkout
      begin
        conn = ar_conn.raw_connection
        conn.send_query(speed_tests)
        conn.set_single_row_mode
        conn.get_result.stream_each do |speed_test|
          g.yield ({name: "ClientSpeedTest", data: speed_test, timestamp: speed_test["processed_at"].to_i})
        end
      ensure
        ActiveRecord::Base::connection_pool.checkin(ar_conn)
      end
    }
  end

  def days_iterator(offset)
    # We use this to trigger actions that check conditions daily
    offset = Event.first.timestamp.to_date.to_time.to_i if offset == 0

    Enumerator.new { |g|
      Time.at(offset).to_date.next_day.upto(Date.today).each do |date|
        g.yield ({name: "DailyTrigger", data: date.at_beginning_of_day, timestamp: date.at_beginning_of_day.to_i})
      end
    }
  end

  def sorted_iteration(iterators)
    Enumerator.new do |g|
      loop do
        next_values = iterators.map do |it|
          content = it.peek rescue nil
          [content[:timestamp], it] if content
        end.compact # drop all nils

        if next_values.blank?
          break
        end

        next_values.sort_by! { |at, it| at }
        at, it = next_values.first

        g.yield it.next
      end
    end
  end
end
