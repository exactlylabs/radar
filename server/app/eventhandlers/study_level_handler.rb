class StudyLevelHandler
  attr_accessor :study_aggregates, :last_objs


  def initialize()
    @last_objs = {}
    @study_aggregates = {}
    Location.where("lonlat IS NOT NULL").each do |location|
      aggs = self.get_aggregates(location.lonlat, nil, nil)
      @study_aggregates[location.lonlat] = aggs
    end
  end

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

  def next_or_nil(enumerator)
    begin
      return enumerator.next
    rescue StopIteration
      return nil
    end
  end

  def new_aggregate!()
    events = self.fetch_from_events
    measurements = self.fetch_from_measurements
    speed_tests = self.fetch_from_speed_tests

    event, event_co = self.next_or_nil(events)
    measurement, measurement_co = self.next_or_nil(measurements)
    speed_test, speed_test_co = self.next_or_nil(speed_tests)

    while event.present? || measurement.present? || speed_test.present?
      pending_elements = []
      pending_elements << ["event", event, event.timestamp.to_i, event_co] if event.present?
      pending_elements << ["measurement", measurement, measurement[3].to_i, measurement_co] if measurement.present?
      pending_elements << ["speed_test", speed_test, speed_test[2].to_i, speed_test_co] if speed_test.present?
      pending_elements.sort_by! { |x| x[2] }

      to_process = pending_elements[0]
      StudyLevelProjection.transaction do
        if to_process[0] == "event"
          self.handle_event to_process[1]
          to_process[3].offset = to_process[1].id
          event, event_co = self.next_or_nil(events)
        elsif to_process[0] == "measurement"
          self.handle_measurement *to_process[1]
          to_process[3].offset = to_process[1][0]
          measurement, measurement_co = self.next_or_nil(measurements)
        elsif to_process[0] == "speed_test"
          self.handle_speed_test *to_process[1]
          to_process[3].offset = to_process[1][0]
          speed_test, speed_test_co = self.next_or_nil(speed_tests)
        end
        to_process[3].save
      end
    end
  end

  # def aggregate!()
  #   consumer_offset = ConsumerOffset.find_or_create_by!(consumer_id: "StudyLevelProjection")
  #   events = Event.where(
  #     "id > ? AND (aggregate_type = ? OR aggregate_type = ?)", 
  #     consumer_offset.offset, Client.name, SystemOutage.name
  #   ).order('timestamp ASC, id ASC')
  #   events.each do |event|
  #     StudyLevelProjection.transaction do 
  #       handle_event event
  #     end
  #     consumer_offset.offset = event.id
  #     consumer_offset.save!(:validate => false)
  #   end
  # end

  private

  def handle_event(event)
    if event.aggregate_type == Client.name
      self.handle_client_event! event
    elsif event.aggregate_type == SystemOutage.name
      self.handle_system_outage_event! event
    end
  end

  def handle_client_event!(event)    
    if event.snapshot.nil? || SystemOutage.at(event.timestamp).exists?
      return
    end
    state = event.snapshot.state
    as_org_id, as_org_name = nil, nil
    if state["autonomous_system_id"].present?
      as_org_id, as_org_name = AutonomousSystem.joins(:autonomous_system_org).where("autonomous_systems.id = ?", state["autonomous_system_id"]).pluck(
        "autonomous_system_orgs.id, autonomous_system_orgs.name"
      ).first
    end

    if state["location_id"].nil? && event.name == Client::Events::LOCATION_CHANGED && event.data["from"].present?
      # In this specific case, when need to decrease from the previous aggregate.
      if state["online"]
        begin
          old_location = Location.with_deleted.find(event.data["from"])
        rescue ActiveRecord::RecordNotFound
          return
        end
        self.get_aggregates(old_location.lonlat, as_org_id, as_org_name).each do |aggregate|
          parent_id = aggregate["parent_id"]
          namespace = aggregate["level"] == 'isp_county' ? 'county' : aggregate["level"]
          old_geospace = Geospace.where(namespace: namespace).containing_lonlat(
            old_location
          ).first
          old_agg_as_org_id = as_org_id if aggregate["level"] == 'isp_county' # only used by isp_county
          old_aggregate = StudyAggregate.find_by(
            geospace: old_geospace, 
            level: aggregate["level"], 
            autonomous_system_org_id: old_agg_as_org_id
          )
          if old_aggregate
            old_count = StudyLevelProjection.latest_for aggregate["level"], parent_id, old_aggregate.id, as_org_id, event.data["from"]
            if old_count.present?
              self.new_record_from_event!(old_count, event, increment=-1)
            end
          end
        end
      end
    elsif state["location_id"].nil?
      return
    end
    
    begin
      location = Location.with_deleted.find(state["location_id"])
    rescue ActiveRecord::RecordNotFound
      return
    end
    aggregates = self.get_aggregates(location.lonlat, as_org_id, as_org_name)

    aggregates.each do |aggregate|  
      parent_id = aggregate["parent_id"]
      last_obj = StudyLevelProjection.latest_for aggregate["level"], parent_id, aggregate["aggregate_id"], as_org_id, state["location_id"]
      if last_obj.nil?
        last_obj = StudyLevelProjection.new(
          level: aggregate["level"],
          parent_aggregate_id: parent_id,
          study_aggregate_id: aggregate["aggregate_id"],
          autonomous_system_org_id: as_org_id,
          location_id: state["location_id"],
          event_id: event.id,
          # lonlat: location.lonlat,
        )
      end
      
      case event.name
      when Client::Events::CREATED
        if state["online"]
          self.new_record_from_event!(last_obj, event, increment=1)
        end
      when Client::Events::LOCATION_CHANGED
        if state["online"]
          self.new_record_from_event!(last_obj, event, increment=1)
          if event.data["from"].present?
            # Since the previous location might belong to another geospace
            # we need to grab the previous study aggregate to make sure we are updating the right thing
            begin
              old_location = Location.with_deleted.find(event.data["from"])
              namespace = aggregate["level"] == 'isp_county' ? 'county' : aggregate["level"]
              old_geospace = Geospace.where(namespace: namespace).containing_lonlat(
                old_location
              ).first
            rescue ActiveRecord::RecordNotFound
              next
            end
            old_agg_as_org_id = as_org_id if aggregate["level"] == 'isp_county' # only used by isp_county
            old_aggregate = StudyAggregate.find_by(
              geospace: old_geospace, 
              level: aggregate["level"], 
              autonomous_system_org_id: old_agg_as_org_id
            )
            if old_aggregate
              old_count = StudyLevelProjection.latest_for aggregate["level"], parent_id, old_aggregate.id, as_org_id, event.data["from"]
              if old_count.present?
                self.new_record_from_event!(old_count, event, increment=-1)
              end
            end
          end
        end
      when Client::Events::AS_CHANGED
        if state["online"]
          self.new_record_from_event!(last_obj, event, increment=1)

          old_as_org_id = nil
          if event.data["from"]
            old_as_org_id = AutonomousSystem.find(event.data["from"]).autonomous_system_org_id
          end
          if aggregate["level"] == 'isp_county' && old_as_org_id.nil?
            next
          end
          old_aggregate_id = aggregate["aggregate_id"]
          if aggregate["level"] == 'isp_county'
            # If the this aggregate uses as_org_id, then the old aggregate is a different one.
            old_aggregate_id = StudyAggregate.find_by(
              geospace_id: aggregate["geospace_id"],
              level: aggregate["level"],
              autonomous_system_org_id: old_as_org_id
            ).id
          end
          old_as_count = StudyLevelProjection.latest_for aggregate["level"], parent_id, old_aggregate_id, old_as_org_id, state["location_id"]
          if old_as_count.present?
            self.new_record_from_event!(old_as_count, event, increment=-1)
          end
        end
      when Client::Events::WENT_ONLINE
        self.new_record_from_event!(last_obj, event, increment=1)
      when Client::Events::WENT_OFFLINE
        self.new_record_from_event!(last_obj, event, increment=-1)
      end
    end
  end

  def handle_system_outage_event!(event)
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
        from_as_org = AutonomousSystem.find(record["from_autonomous_system_id"]).autonomous_system_org if record["from_autonomous_system_id"]
        to_as_org = AutonomousSystem.find(record["to_autonomous_system_id"]).autonomous_system_org if record["to_autonomous_system_id"]
        if record["from_online"]
          begin
            location = Location.with_deleted.find(record["from_location_id"])
          rescue ActiveRecord::RecordNotFound
            return
          end
          self.get_aggregates(location.lonlat, from_as_org&.id, from_as_org&.name).each do |aggregate|
            parent_id = aggregate["parent_id"]
            old_count = StudyLevelProjection.latest_for aggregate["level"], parent_id, aggregate["aggregate_id"], from_as_org&.id, record["from_location_id"]
            self.new_record_from_event!(old_count, event, increment=-1)
          end
        end
        if record["to_online"]
          begin
            location = Location.with_deleted.find(record["to_location_id"])
          rescue ActiveRecord::RecordNotFound
            return
          end
          self.get_aggregates(location.lonlat, to_as_org&.id, to_as_org&.name).each do |aggregate|
            parent_id = aggregate["parent_id"]
            new_count = StudyLevelProjection.latest_for aggregate["level"], parent_id, aggregate["aggregate_id"], to_as_org&.id, record["to_location_id"]
            if new_count.nil?
              new_count = StudyLevelProjection.new(
                level: aggregate["level"],
                parent_aggregate_id: parent_id,
                study_aggregate_id: aggregate["aggregate_id"],
                autonomous_system_org_id: to_as_org&.id,
                location_id: record["to_location_id"],
                event_id: event.id,
                # lonlat: location.lonlat,
              )
            end
            self.new_record_from_event!(new_count, event, increment=1)
          end
        end
      end
    end
  end

  def handle_measurement(id, location_id, lonlat, timestamp, as_org_id, as_org_name)
    self.get_aggregates(lonlat, as_org_id, as_org_name).each do |aggregate|
      parent_id = aggregate["parent_id"]
      dimension_key = "#{aggregate["level"]}, #{parent_id}, #{aggregate["aggregate_id"]}, #{as_org_id}, #{location_id}"
      last_obj = @last_objs[dimension_key]
      if last_obj.nil?
        last_obj = StudyLevelProjection.latest_for aggregate["level"], parent_id, aggregate["aggregate_id"], as_org_id, location_id
      end
      if last_obj.nil?
        last_obj = StudyLevelProjection.new(
          level: aggregate["level"],
          parent_aggregate_id: parent_id,
          study_aggregate_id: aggregate["aggregate_id"],
          autonomous_system_org_id: as_org_id,
          location_id: location_id,
          measurement_id: id,
        )        
      end

      obj = self.new_record_from_measurement! id, timestamp, last_obj
      @last_objs[dimension_key] = obj
    end
  end

  def handle_speed_test(id, lonlat, timestamp, as_org_id, as_org_name)
    self.get_aggregates(lonlat, as_org_id, as_org_name).each do |aggregate|
      parent_id = aggregate["parent_id"]
      dimension_key = "#{aggregate["level"]}, #{parent_id}, #{aggregate["aggregate_id"]}, #{as_org_id}"
      last_obj = @last_objs[dimension_key]
      if last_obj.nil?
        last_obj = StudyLevelProjection.latest_for_with_lonlat aggregate["level"], parent_id, aggregate["aggregate_id"], as_org_id, lonlat
      end
      if last_obj.nil?
        last_obj = StudyLevelProjection.new(
          level: aggregate["level"],
          parent_aggregate_id: parent_id,
          study_aggregate_id: aggregate["aggregate_id"],
          autonomous_system_org_id: as_org_id,
          lonlat: lonlat,
          client_speed_test_id: id,
        )
      end

      obj = self.new_record_from_measurement! id, timestamp, last_obj
      @last_objs[dimension_key] = obj
    end

  end

  def new_record_from_event!(last_obj, event, increment=0)
    obj = StudyLevelProjection.new(
      last_obj.attributes.except("id", "timestamp", "event_id", "measurement_id", "client_speed_test_id", "incr", "location_online_diff")
    )
    obj.event_id = event.id    
    obj.timestamp = event.timestamp
    obj.online_count += increment
    obj.incr = increment
    if obj.online_count > 0 && !obj.location_online
      obj.location_online = true
      obj.location_online_diff = 1
    elsif obj.online_count == 0 && obj.location_online
      obj.location_online = false
      obj.location_online_diff = -1
    else
      obj.location_online_diff = 0
    end

    # TODO: Implement completed locations logic here as well in the future
    obj.save!(:validate => false)
    return obj
  end

  def new_record_from_measurement!(id, timestamp, last_obj)
    obj = StudyLevelProjection.new(last_obj.attributes.except("id", "timestamp", "measurement_id", "event_id", "client_speed_test_id", "incr", "location_online_diff"))
    obj.measurement_id = id
    obj.timestamp = timestamp
    obj.measurement_count += 1
    obj.save!(:validate => false)
    return obj
  end

  def get_aggregates(lonlat, as_org_id, as_org_name)
    aggs = @study_aggregates[lonlat].dup
    if aggs.blank?
      geospaces = []
      Geospace.containing_lonlat(lonlat).each do |geospace|
        geospaces << {"id" => geospace.id, "ns" => geospace.namespace, "name" => geospace.name}
      end 

      aggs = []
      # state level
      state = geospaces.find {|g| g["ns"] == "state"}
      state_agg = nil
      if state
        state_agg = StudyAggregate.find_or_create_by!(name: state["name"], level: 'state', geospace_id: state["id"]).tap do |agg|
          aggs << {"level" => "state", "aggregate_id" => agg.id, "parent_id" => nil, "name" => agg.name, "geospace_id" => agg.geospace_id}
        end
      end

      # county level
      county = geospaces.find {|g| g["ns"] == "county"}
      county_agg = nil
      if county
        county_agg = StudyAggregate.find_or_create_by!(name: county["name"], level: 'county', parent_aggregate: state_agg, geospace_id: county["id"]).tap do |agg|
          aggs << {"level" => "county", "aggregate_id" => agg.id, "parent_id" => state_agg.id, "name" => agg.name, "geospace_id" => agg.geospace_id}
        end

        # ISP-County level
        if as_org_id.present?
          StudyAggregate.find_or_create_by!(name: "#{as_org_name} -> #{county["name"]}", level: 'isp_county', autonomous_system_org_id: as_org_id, parent_aggregate: state_agg, geospace_id: county["id"]).tap do |agg|
            aggs << {"level" => "isp_county", "aggregate_id" => agg.id, "parent_id" => state_agg.id, "name" => agg.name, "geospace_id" => agg.geospace_id}
          end
        end
      end

      # census place level
      census_place = geospaces.find {|g| g["ns"] == "census_place"}
      if census_place
        StudyAggregate.find_or_create_by!(name: census_place["name"], level: 'census_place', parent_aggregate: county_agg, geospace_id: census_place["id"]).tap do |agg|
          aggs << {"level" => "census_place", "aggregate_id" => agg.id, "parent_id" => county_agg.id, "name" => agg.name, "geospace_id" => agg.geospace_id}
        end
      end
    elsif as_org_id.present?
      county_agg = aggs.find {|a| a["level"] == "county"}
      # ISP-County level
      if as_org_id.present?
        StudyAggregate.find_or_create_by!(name: "#{as_org_name} -> #{county_agg["name"]}", level: 'isp_county', autonomous_system_org_id: as_org_id, parent_aggregate_id: county_agg["parent_id"], geospace_id: county_agg["geospace_id"]).tap do |agg|
          aggs << {"level" => "isp_county", "aggregate_id" => agg.id, "parent_id" => agg.parent_aggregate_id, "name" => agg.name, "geospace_id" => agg.geospace_id}
        end
      end
    end
    

    return aggs
  end

end