require 'pg'
require './app/eventhandlers/fetchers.rb'


module StudyMetricsProjectionProcessor
  class Processor
    include StudyMetricsProjectionProcessor::Common
    include StudyMetricsProjectionProcessor::MeasurementsProcessor
    include StudyMetricsProjectionProcessor::EventsProcessor
    include StudyMetricsProjectionProcessor::DailyTriggerProcessor
    include Fetchers

    MAX_QUEUE_SIZE = 50000

    def initialize
      @insertion_queue = []
      @projections = {}
      @consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "MetricsProjectionProcessor")
      @last_event_of_aggregate = {}

      @consumer_offset.state["open_buckets"] ||= {}
    end

    def inspect()
      return "MetricsProjectionProcessor::Processor"
    end

    def process()
      Rails.logger.info "Starting Processor"
      conn = ActiveRecord::Base.connection_pool.checkout
      loaded = false
      offsets = {
        events_offset: @consumer_offset.state["events_offset"] || 0,
        measurements_offset: @consumer_offset.state["measurements_offset"] || 0,
        speed_tests_offset: @consumer_offset.state["speed_tests_offset"] || 0,
        daily_trigger_offset: @consumer_offset.state["daily_trigger_offset"] || 0,
      }

      begin
        @raw = conn.raw_connection
        self.sources_iterator(**offsets).each do |source, value|
          self.load_distinct_projections if !loaded
          loaded = true
          @projection_updated = false
          timestamp = nil
          case source
          when "event"
            self.handle_event value
            @consumer_offset.state["events_offset"] = value.id
            timestamp = value.timestamp

          when "measurement"
            self.handle_measurement value["id"], value["location_id"], value["lonlat"], value["processed_at"], value["autonomous_system_org_id"], value["autonomous_system_org_name"]
            @consumer_offset.state["measurements_offset"] = value["id"]
            timestamp = value["processed_at"]

          when "speed_test"
            self.handle_speed_test value["id"], value["lonlat"], value["processed_at"], value["autonomous_system_org_id"], value["autonomous_system_org_name"]
            @consumer_offset.state["speed_tests_offset"] = value["id"]
            timestamp = value["processed_at"]

          when "daily_trigger"
            self.handle_daily_trigger value
            @consumer_offset.state["daily_trigger_offset"] = value.to_time.to_i
            timestamp = value.to_time
          end

          self.close_finished_buckets(timestamp)
          self.push_projections_to_queue(timestamp) if @projection_updated

          if @insertion_queue.size > MAX_QUEUE_SIZE
            self.flush_insertion_queue
          end
        end
        self.flush_insertion_queue
      ensure
        ActiveRecord::Base.connection_pool.checkin(conn)
      end

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

    def push_projections_to_queue(timestamp, **opts)
      @projections.values.each do |projection|
        obj = projection.dup
        obj["timestamp"] = timestamp
        obj["bucket_name"] = opts[:bucket_name]
        @insertion_queue << obj
      end
    end

    def load_distinct_projections()
      Rails.logger.info "Loading distinct projections"
      # Loads all distinct projections to be propagated whith every new metric increment
      query = %{
        SELECT DISTINCT ON (study_aggregate_id, autonomous_system_org_id) study_aggregate_id, autonomous_system_org_id,
          parent_aggregate_id, online_pods_count, online_locations_count, measurements_count, points_with_tests_count,
          completed_locations_count
        FROM metrics_projections
        ORDER BY study_aggregate_id, autonomous_system_org_id, timestamp DESC
      }

      records = ActiveRecord::Base.connection.execute(query)
      records.each do |projection|
        @projections["#{projection["study_aggregate_id"]}-#{projection["autonomous_system_org_id"]}"] = projection
      end
      Rails.logger.info "Projections Pre-loaded"
    end

    def update_projection(study_aggregate, as_org_id, metric_type, incr, **opts)
      # increment the value of the projection's metric_type
      proj = self.get_projection(study_aggregate.id, study_aggregate.parent_aggregate_id, as_org_id)
      proj[metric_type] += incr
      @projection_updated = true if opts.fetch(:send_to_queue, true)
    end

    def set_projection(study_aggregate, as_org_id, metric_type, value, **opts)
      # Set the value of a metric_type, instead of incrementing it
      proj = self.get_projection(study_aggregate.id, study_aggregate.parent_aggregate_id, as_org_id)
      proj[metric_type] = value
      @projection_updated = true if opts.fetch(:send_to_queue, true)
    end

    private

    def get_projection(study_aggregate_id, parent_aggregate_id, as_org_id)
      proj = @projections["#{study_aggregate_id}-#{as_org_id}"]
      if proj.nil?
        proj = {
          "parent_aggregate_id" => parent_aggregate_id,
          "study_aggregate_id" => study_aggregate_id,
          "autonomous_system_org_id" => as_org_id,
          "online_pods_count" => 0,
          "online_locations_count" => 0,
          "measurements_count" => 0,
          "points_with_tests_count" => 0,
          "completed_locations_count" => 0,
        }
        @projections["#{study_aggregate_id}-#{as_org_id}"] = proj
      end
      return proj
    end

    def flush_insertion_queue()
      # Save current insertions into the DB and update the offsets in a single transaction
      if @insertion_queue.size == 0
        return
      end
      @raw.transaction do
        Rails.logger.info "Flushing insertion queue with #{@insertion_queue.size} elements"
        t = Time.now
        @consumer_offset.save!
        @raw.exec("COPY metrics_projections (timestamp, study_aggregate_id, parent_aggregate_id, autonomous_system_org_id, online_pods_count, online_locations_count, measurements_count, points_with_tests_count, completed_locations_count, bucket_name) FROM STDIN CSV")
        @insertion_queue.each do |row|
          @raw.put_copy_data("#{row["timestamp"].iso8601(9)},#{row["study_aggregate_id"]},#{row["parent_aggregate_id"]},#{row["autonomous_system_org_id"]},#{row["online_pods_count"]},#{row["online_locations_count"]},#{row["measurements_count"]},#{row["points_with_tests_count"]},#{row["completed_locations_count"]},#{row["bucket_name"]}\n")
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
end
