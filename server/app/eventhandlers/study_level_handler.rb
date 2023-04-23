require 'study_level_handler/base'
require 'study_level_handler/client_events_handler'
require 'study_level_handler/fetchers'
require 'study_level_handler/measurements_handler'
require 'study_level_handler/system_outage_events_handler'
require 'study_level_handler/daily_trigger_handler'

module StudyLevelHandler
  

  class Handler    
    include StudyLevelHandler::Base
    include StudyLevelHandler::ClientEventsHandler
    include StudyLevelHandler::Fetchers
    include StudyLevelHandler::MeasurementsHandler
    include StudyLevelHandler::SystemOutageEventsHandler
    include StudyLevelHandler::DailyTriggerHandler

    def initialize()
      @last_objs = {}
      @study_aggregates = {}
      @locations_with_tests = {}

      Location.where("lonlat IS NOT NULL").each do |location|
        aggs = self.get_aggregates(location.lonlat, nil, nil)
        @study_aggregates[location.lonlat] = aggs
      end
      
    end

    def aggregate!()
      events = self.fetch_from_events
      measurements = self.fetch_from_measurements
      speed_tests = self.fetch_from_speed_tests
      daily_triggers = self.fetch_from_daily_trigger

      event, event_co = self.next_or_nil(events)
      measurement, measurement_co = self.next_or_nil(measurements)
      speed_test, speed_test_co = self.next_or_nil(speed_tests)
      next_date, daily_trigger_co = self.next_or_nil(daily_triggers)
      
      while event.present? || measurement.present? || speed_test.present?
        pending_elements = []
        pending_elements << ["event", event, event.timestamp.to_i, event_co] if event.present?
        pending_elements << ["measurement", measurement, measurement[3].to_i, measurement_co] if measurement.present?
        pending_elements << ["speed_test", speed_test, speed_test[2].to_i, speed_test_co] if speed_test.present?
        pending_elements << ['daily_trigger', next_date, next_date.to_time.to_i, daily_trigger_co] if next_date.present?
        pending_elements.sort_by! { |x| x[2] }

        source, source_data, timestamp, consumer_offset = pending_elements[0]
        StudyLevelProjection.transaction do
          if source == "event"
            self.handle_event source_data
            consumer_offset.offset = source_data.id
            event, event_co = self.next_or_nil(events)
          
          elsif source == "measurement"
            self.handle_measurement *source_data
            consumer_offset.offset = source_data[0]
            measurement, measurement_co = self.next_or_nil(measurements)
          
          elsif source == "speed_test"
            self.handle_speed_test *source_data
            consumer_offset.offset = source_data[0]
            speed_test, speed_test_co = self.next_or_nil(speed_tests)
          
          elsif source == 'daily_trigger'
            self.handle_daily_trigger source_data
            consumer_offset.offset = timestamp.to_i
            next_date, daily_trigger_co = self.next_or_nil(daily_triggers)
          end
          
          consumer_offset.save
        end
      end
    end

    private

    def next_or_nil(enumerator)
      begin
        return enumerator.next
      rescue StopIteration
        return nil
      end
    end

  end
end