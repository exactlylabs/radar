module StudyLevelHandler
  module Fetchers
      
    def fetch_from_events()
      consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "StudyLevelHandler#events")
      events = Event.where(
        "id > ? AND (aggregate_type = ? OR aggregate_type = ?)", 
        consumer_offset.offset, Client.name, SystemOutage.name
      ).order('timestamp ASC, version ASC')
      Enumerator.new { |g| 
        events.each do |event|
          g.yield event, consumer_offset
        end
      }
    end

    def fetch_from_measurements()
      consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "StudyLevelHandler#measurements")
      measurements = Measurement.joins(:autonomous_system => [:autonomous_system_org]).where(
        "processed = true AND measurements.id > ? AND lonlat IS NOT NULL AND location_id IS NOT NULL", 
        consumer_offset.offset
      ).order("processed_at ASC, measurements.id ASC").pluck(
        "measurements.id, measurements.location_id, measurements.lonlat, measurements.processed_at, autonomous_system_orgs.id, autonomous_system_orgs.name"
      )
      Enumerator.new { |g| 
        measurements.each do |measurement|
          g.yield measurement, consumer_offset
        end
      }
    end

    def fetch_from_speed_tests()
      consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "StudyLevelHandler#speed_tests")
      speed_tests = ClientSpeedTest.joins(:autonomous_system => [:autonomous_system_org]).where(
        "processed_at IS NOT NULL AND client_speed_tests.id > ? AND lonlat IS NOT NULL", 
        consumer_offset.offset
      ).order("processed_at ASC, client_speed_tests.id ASC").pluck(
        "client_speed_tests.id, client_speed_tests.lonlat, client_speed_tests.processed_at, autonomous_system_orgs.id, autonomous_system_orgs.name"
      )
      Enumerator.new { |g|
        speed_tests.each do |speed_test|
          g.yield speed_test, consumer_offset        
        end
      }
    end

    def fetch_from_daily_trigger()
      # We use this to trigger actions that check conditions daily
      consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "StudyLevelHandler#daily_events")
      consumer_offset.offset = Event.first.timestamp.to_date.to_time.to_i if consumer_offset.offset == 0

      Enumerator.new { |g| 
        Time.at(consumer_offset.offset).to_date.next_day.upto(Date.today).each do |date| 
          g.yield date, consumer_offset
        end
      }
    end
  end
end