module Fetchers
  DEFAULT_BATCH_SIZE = 10000

  def events_iterator(model, offset, batch_size: DEFAULT_BATCH_SIZE)
    Enumerator.new { |g|
      events = Event.where(
        "id > ? AND aggregate_type = ?", offset, model.name
      ).order('timestamp ASC, version ASC').preload(:snapshot, :aggregate).find_each(batch_size: batch_size) do |event|
        g.yield ({name: model.name, data: event, timestamp: event.timestamp.to_i})
      end
    }
  end

  def measurements_iterator(offset, batch_size: DEFAULT_BATCH_SIZE)
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

    Enumerator.new { |g|
      measurements = Measurement.joins(:autonomous_system => [:autonomous_system_org]).where(
        "processed = true AND measurements.id > ? AND lonlat IS NOT NULL AND location_id IS NOT NULL",
        offset
      ).order(
        "processed_at ASC, measurements.id ASC"
      ).in_batches(of: batch_size) do |measurements|
        measurements.pluck(*attrs).each do |measurement|
          data = attrs_name.zip(measurement).to_h
          g.yield ({name: "Measurements", data: data, timestamp: data["processed_at"].to_i})
        end
      end
    }
  end

  def client_speed_tests_iterator(offset, batch_size: DEFAULT_BATCH_SIZE)
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

    speed_tests = ClientSpeedTest.joins(:autonomous_system => [:autonomous_system_org]).where(
      "processed_at IS NOT NULL AND client_speed_tests.id > ? AND lonlat IS NOT NULL",
      offset
    ).order("processed_at ASC, client_speed_tests.id ASC")
    Enumerator.new { |g|
      speed_tests.in_batches(of: batch_size) do |speed_tests|
        speed_tests.pluck(*attrs).each do |speed_test|
          data = attrs_name.zip(speed_test).to_h
          g.yield ({name: "ClientSpeedTest", data: data, timestamp: data["processed_at"].to_i})
        end
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
