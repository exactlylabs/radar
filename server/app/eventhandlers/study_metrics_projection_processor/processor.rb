require 'pg'
require './app/eventhandlers/fetchers.rb'


module StudyMetricsProjectionProcessor
  class Processor
    include StudyMetricsProjectionProcessor::Common
    include StudyMetricsProjectionProcessor::MeasurementsProcessor
    include StudyMetricsProjectionProcessor::EventsProcessor
    include StudyMetricsProjectionProcessor::DailyTriggerProcessor
    include Fetchers

    MAX_QUEUE_SIZE = 100000

    def initialize
      @insertion_queue = []
      @consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "MetricsProjectionProcessor")

      # Initialize states in case of first run.
      @consumer_offset.state["open_buckets"] ||= {}
      @consumer_offset.state["locations_online_days_count"] ||= {}
      @consumer_offset.state["projections"] ||= {}
      @consumer_offset.state["locations_state"] ||= {}

      @lonlats ||= {}
      @location_metadatas = self.load_location_metadatas
    end

    def self.clear
      ActiveRecord::Base.connection.transaction do
        ActiveRecord::Base.connection.execute("TRUNCATE TABLE metrics_projections, location_metadata_projections")
        ConsumerOffset.find_by(consumer_id: "MetricsProjectionProcessor")&.destroy
      end
      return
    end

    def inspect()
      return "MetricsProjectionProcessor::Processor"
    end

    def process()
      Rails.logger.info "Starting Processor"
      t = Time.now
      conn = ActiveRecord::Base.connection_pool.checkout
      offsets = {
        client_events_timestamp: @consumer_offset.state["client_events_timestamp"] || 0,
        sys_outage_events_offset: @consumer_offset.state["sys_outage_events_offset"] || 0,
        measurements_offset: @consumer_offset.state["measurements_offset"] || 0,
        speed_tests_offset: @consumer_offset.state["speed_tests_offset"] || 0,
        daily_trigger_offset: @consumer_offset.state["daily_trigger_offset"] || 0,
      }
      iterators = [
        self.events_iterator(Client, offsets[:client_events_timestamp], filter_timestamp: true),
        self.events_iterator(SystemOutage, offsets[:sys_outage_events_offset]),
        self.measurements_iterator(offsets[:measurements_offset]),
        self.client_speed_tests_iterator(offsets[:speed_tests_offset]),
        self.days_iterator(offsets[:daily_trigger_offset]),
      ]

      begin
        @raw = conn.raw_connection
        self.sorted_iteration(iterators).each do |content|
          source = content[:name]
          value = content[:data]
          timestamp = Time.at(content[:timestamp])

          @projection_updated = false
          Rails.logger.debug("Processing #{source} at #{timestamp}")
          case source
          when Client.name || SystemOutage.name
            self.handle_event value
            @consumer_offset.state["client_events_timestamp"] = value["timestamp"].to_f if source == "Client"
            @consumer_offset.state["sys_outage_events_offset"] = value["id"] if source == "SystemOutage"

          when Measurement.name
            value["lonlat"] =
            self.handle_measurement value["id"], value["location_id"], value["longitude"], value["latitude"], value["processed_at"], value["autonomous_system_org_id"], value["autonomous_system_org_name"]
            @consumer_offset.state["measurements_offset"] = value["id"]

          when ClientSpeedTest.name
            self.handle_speed_test value["id"], value["longitude"], value["latitude"], value["processed_at"], value["autonomous_system_org_id"], value["autonomous_system_org_name"]
            @consumer_offset.state["speed_tests_offset"] = value["id"]

          when "DailyTrigger"
            self.handle_daily_trigger value
            @consumer_offset.state["daily_trigger_offset"] = value.to_time.to_i

          end

          self.close_finished_buckets(timestamp)

          if @insertion_queue.size > MAX_QUEUE_SIZE
            self.flush_insertion_queue
          end
        end
        self.flush_insertion_queue
      ensure
        ActiveRecord::Base.connection_pool.checkin(conn)
      end
      Rails.logger.info "Processor took #{Time.now - t} seconds"
      return nil
    end

    def close_finished_buckets(current_timestamp)
      @consumer_offset.state["buckets"] ||= {}
      @consumer_offset.state["buckets"]["hourly"] ||= (current_timestamp.at_beginning_of_hour + 1.hour).to_i
      @consumer_offset.state["buckets"]["daily"] ||= (current_timestamp.at_beginning_of_day + 1.day).to_i

      if @consumer_offset.state["buckets"]["hourly"] < current_timestamp.to_i
        self.push_projections_to_queue(Time.at(@consumer_offset.state["buckets"]["hourly"]), bucket_name: "hourly")
        @consumer_offset.state["buckets"]["hourly"] = (current_timestamp.at_beginning_of_hour + 1.hour).to_i
      end
      if @consumer_offset.state["buckets"]["daily"] < current_timestamp.to_i
        self.push_projections_to_queue(Time.at(@consumer_offset.state["buckets"]["daily"]), bucket_name: "daily")
        @consumer_offset.state["buckets"]["daily"] = (current_timestamp.at_beginning_of_day + 1.day).to_i
      end
    end

    ##
    #
    # Directly push a single dimension-set current state to the insertion queue in the given timestamp
    #
    ##
    def push_projection_to_queue(timestamp, study_aggregate_id, parent_aggregate_id, as_org_id, **opts)
      obj = self.get_projection(study_aggregate_id, parent_aggregate_id, as_org_id).dup
      obj["timestamp"] = timestamp
      obj["bucket_name"] = opts[:bucket_name]
      @insertion_queue << obj
    end

    ##
    #
    # Pushes all dimension-set projections existent to insertion under the same timestamp
    #
    # This ensures we have a way of rolling up all the dimension-sets for a given timestamp, without the need to look back in time.
    # Although it's great for querying, considering we know the count for all dimensions at a given time,
    # it takes too much space in disk and insertion is slower, as every single point results in an insertion for all dimensions existent.
    #
    ##
    def push_projections_to_queue(timestamp, **opts)
      @consumer_offset.state["projections"].values.each do |projection|
        obj = projection.dup
        obj["timestamp"] = timestamp
        obj["bucket_name"] = opts[:bucket_name]
        @insertion_queue << obj
      end
    end

    def update_projection(study_aggregate, as_org_id, metric_type, incr)
      # increment the value of the projection's metric_type
      proj = self.get_projection(study_aggregate.id, study_aggregate.parent_aggregate_id, as_org_id)
      proj[metric_type] += incr
    end

    def set_projection(study_aggregate, as_org_id, metric_type, value)
      # Set the value of a metric_type, instead of incrementing it
      proj = self.get_projection(study_aggregate.id, study_aggregate.parent_aggregate_id, as_org_id)
      proj[metric_type] = value
    end

    private

    def flush_insertion_queue()
      # Save current insertions into the DB, update the offsets, and location metadatas in a single transaction
      @raw.transaction do
        Rails.logger.info "Flushing insertion queue with #{@insertion_queue.size} elements"
        t = Time.now
        @consumer_offset.save!
        @location_metadatas.values.each do |meta|
          meta.save!
        end
        if @insertion_queue.size > 0
          @raw.exec("COPY metrics_projections (timestamp, study_aggregate_id, parent_aggregate_id, autonomous_system_org_id, online_pods_count, online_locations_count, measurements_count, points_with_tests_count, completed_locations_count, completed_and_online_locations_count, bucket_name) FROM STDIN CSV")
          @insertion_queue.each do |row|
            @raw.put_copy_data(
              "#{row["timestamp"].iso8601(9)},#{row["study_aggregate_id"]},#{row["parent_aggregate_id"]},#{row["autonomous_system_org_id"]},#{row["online_pods_count"]},#{row["online_locations_count"]},#{row["measurements_count"]},#{row["points_with_tests_count"]},#{row["completed_locations_count"]},#{row["completed_and_online_locations_count"]},#{row["bucket_name"]}\n")
          end
          @raw.put_copy_end
          while res = @raw.get_result do
            if res.result_status != 1
              raise res.error_message
            end
          end
          Rails.logger.info "Insertion took #{Time.now - t} seconds"
        end
      end
      @insertion_queue = []
    end

  end
end
