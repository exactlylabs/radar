module Fetchers
  DEFAULT_BATCH_SIZE = 10000

  def fetch_from_events(offset, **opts)
    batch_size = opts[:batch_size] || DEFAULT_BATCH_SIZE
    Enumerator.new { |g|
      events = Event.where(
        "id > ? AND (aggregate_type = ? OR aggregate_type = ?)", offset, Client.name, SystemOutage.name
      ).order('timestamp ASC, version ASC').find_each(batch_size: batch_size) do |event|
        g.yield event
      end
    }
  end

  def fetch_from_measurements(offset, **opts)
    attrs = %w(
      measurements.id
      measurements.location_id
      measurements.lonlat
      measurements.processed_at
      autonomous_system_orgs.id
      autonomous_system_orgs.name
    )
    attrs_name = %w(
      id
      location_id
      lonlat
      processed_at
      autonomous_system_org_id
      autonomous_system_org_name
    )
    batch_size = opts[:batch_size] || DEFAULT_BATCH_SIZE
    Enumerator.new { |g|
      measurements = Measurement.joins(:autonomous_system => [:autonomous_system_org]).where(
        "processed = true AND measurements.id > ? AND lonlat IS NOT NULL AND location_id IS NOT NULL",
        offset
      ).order(
        "processed_at ASC, measurements.id ASC"
      ).in_batches(of: batch_size) do |measurements|
        measurements.pluck(*attrs).each do |measurement|
          g.yield attrs_name.zip(measurement).to_h
        end
      end
    }
  end

  def fetch_from_speed_tests(offset, **opts)
    attrs = %w(
      client_speed_tests.id
      client_speed_tests.lonlat
      client_speed_tests.processed_at
      autonomous_system_orgs.id
      autonomous_system_orgs.name
    )

    attrs_name = %w(
      id
      lonlat
      processed_at
      autonomous_system_org_id
      autonomous_system_org_name
    )
    batch_size = opts[:batch_size] || DEFAULT_BATCH_SIZE
    speed_tests = ClientSpeedTest.joins(:autonomous_system => [:autonomous_system_org]).where(
      "processed_at IS NOT NULL AND client_speed_tests.id > ? AND lonlat IS NOT NULL",
      offset
    ).order("processed_at ASC, client_speed_tests.id ASC")
    Enumerator.new { |g|
      speed_tests.in_batches(of: batch_size) do |speed_tests|
        speed_tests.pluck(*attrs).each do |speed_test|
          g.yield attrs_name.zip(speed_test).to_h
        end
      end
    }
  end

  def fetch_from_daily_trigger(offset)
    # We use this to trigger actions that check conditions daily
    offset = Event.first.timestamp.to_date.to_time.to_i if offset == 0

    Enumerator.new { |g|
      Time.at(offset).to_date.next_day.upto(Date.yesterday).each do |date|
        g.yield date
      end
    }

  end

  def sources_iterator(**opts)
    events_offset = opts[:events_offset]
    measurements_offset = opts[:measurements_offset]
    speed_tests_offset = opts[:speed_tests_offset]
    daily_trigger_offset = opts[:daily_trigger_offset]

    # Returns a single iterator that selects the next element from all sources
    events = fetch_from_events events_offset if events_offset.present?
    measurements = fetch_from_measurements measurements_offset if measurements_offset.present?
    speed_tests = fetch_from_speed_tests speed_tests_offset if speed_tests_offset.present?
    daily_triggers = fetch_from_daily_trigger daily_trigger_offset if daily_trigger_offset.present?

    Enumerator.new do |g|
      loop do
        next_values = []
        next_values << ["event", events.peek.timestamp.to_i, events] if (events.peek rescue nil)
        next_values << ["measurement", measurements.peek["processed_at"].to_i, measurements] if (measurements.peek rescue nil)
        next_values << ["speed_test", speed_tests.peek["processed_at"].to_i, speed_tests] if (speed_tests.peek rescue nil)
        next_values << ["daily_trigger", daily_triggers.peek.to_time.to_i, daily_triggers] if (daily_triggers.peek rescue nil)
        if next_values.blank?
          break
        end
        next_values.sort_by! { |name, at, it| at }
        name, at, it = next_values.first

        g.yield [name, it.next]
      end
    end
  end
end
