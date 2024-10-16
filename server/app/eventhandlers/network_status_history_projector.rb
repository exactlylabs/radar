class NetworkStatusHistoryProjector < Projector
  self.projection_model = NetworkStatusHistoryProjection

  def initialize
    super
    @state["networks_metadata"] ||= {}
    @state["pods_metadata"] ||= {}

    @networks_metadata = @state["networks_metadata"]
    @pods_metadata = @state["pods_metadata"]
  end

  def process!
    offsets = {
      client_events_timestamp: @consumer_offset.state["client_events_timestamp"] || 0,
      sys_outage_events_offset: @consumer_offset.state["sys_outage_events_offset"] || 0,
    }
    iterators = [
      self.events_iterator(Client, offsets[:client_events_timestamp], filter_timestamp: true),
      self.events_iterator(SystemOutage, offsets[:sys_outage_events_offset]),
    ]
    self.sorted_iteration(iterators).each_slice(2000) do |chunk|
      t = Time.now
      NetworkStatusHistoryProjection.transaction do
        chunk.each do |content|
          event = content[:data]

          if event["aggregate_type"] == Client.name
            self.handle_client_event event
            @consumer_offset.state["client_events_timestamp"] = event["timestamp"].to_f

          elsif event["aggregate_type"] == SystemOutage.name
            self.handle_system_outage_event event
            @consumer_offset.state["sys_outage_events_offset"] = event["id"]
          end
        end

        # Store current active statuses so we don't leave gaps in the data.
        @networks_metadata.each do |location_id, data|
          if data["current_online_status"] && data["current_online_status"]["id"].nil?
            proj = NetworkStatusHistoryProjection.new(data["current_online_status"])
            proj.save!(validate: false)
            data["current_online_status"]["id"] = proj.id
          end

          if data["current_in_service_status"] && data["current_in_service_status"]["id"].nil?
            proj = NetworkStatusHistoryProjection.new(data["current_in_service_status"])
            proj.save!(validate: false)
            data["current_in_service_status"]["id"] = proj.id
          end
        end
        @consumer_offset.save!
      end
      Rails.logger.info "Stored chunk in #{Time.now - t} seconds"
    end
  end

  def handle_client_event(event)
    if event["snapshot_id"].nil?
      return
    end

    pod_id = event["aggregate_id"]
    pod_state = event["snapshot_state"]
    @pods_metadata[pod_id] = pod_state   
    location_id = pod_state["location_id"]

    timestamp = event["timestamp"]

    with_previous_state(Client, pod_state, pod_id, timestamp) do |previous_pod_state, pod_state|
      online_changed = pod_state["online"] != previous_pod_state&.fetch("online", false)
      location_changed = pod_state["location_id"] != previous_pod_state&.fetch("location_id", nil)
      service_started = event["name"] == Client::Events::SERVICE_STARTED

      if location_changed
        handle_pod_added_to_location(pod_id, location_id, timestamp) if pod_state["location_id"]

        if previous_pod_state.present? && previous_pod_state["location_id"].present?
          handle_pod_removed_from_location(pod_id, previous_pod_state["location_id"], timestamp)
        end
      elsif online_changed && pod_state["online"]
        handle_pod_online(pod_id, location_id, timestamp)
      elsif online_changed
        handle_pod_offline(pod_id, location_id, timestamp)
      elsif service_started
        handle_pod_service_started(pod_id, location_id, timestamp)
      end
    end
  end

  def handle_system_outage_event(event)
    system_outage = event["snapshot_state"]

    case event["name"]
    when SystemOutage::Events::CREATED
      @state["system_outage"] = true

    when SystemOutage::Events::FINISHED
      @state["system_outage"] = false
    end
  end

  private

  def handle_pod_online(pod_id, location_id, timestamp)
    unless location_id.present? && network_metadata(location_id)["online"]
      handle_location_online(pod_id, location_id, timestamp)
    end
  end

  def handle_pod_offline(pod_id, location_id, timestamp)
    if location_id.present? && network_metadata(location_id)["online"]
      handle_location_offline(pod_id, location_id, timestamp)
    end
  end

  def handle_location_offline(pod_id, location_id, timestamp)
    network_metadata(location_id)["online"] = false
    
    current_online_status = network_metadata(location_id)["current_online_status"]
    
    if current_online_status.present? && current_online_status["status"] == "went_online"
      current_online_status["finished_at"] = timestamp
      if current_online_status["id"].present?
        NetworkStatusHistoryProjection.where(id: current_online_status["id"]).update_all(current_online_status)
      else
        NetworkStatusHistoryProjection.new(current_online_status).save!(validate: false)
      end
    end

    unless current_online_status.present? && current_online_status["status"] == "went_offline"
      as_id = pod_metadata(pod_id)["autonomous_system_id"]
      network_metadata(location_id)["current_online_status"] = {
        "status" => "went_offline",
        "location_id" => location_id,
        "started_at" => timestamp,
        "autonomous_system_id" => as_id,
        "reason" => @state["system_outage"] ? "system_outage" : "disconnected",
      }
    end    
  end

  def handle_location_online(pod_id, location_id, timestamp)
    network_metadata(location_id)["online"] = true
    current_online_status = network_metadata(location_id)["current_online_status"]

    if current_online_status.present? && current_online_status["status"] == "went_offline"
      current_online_status["finished_at"] = timestamp
      if current_online_status["id"].present?
        NetworkStatusHistoryProjection.where(id: current_online_status["id"]).update_all(current_online_status)
      else
        NetworkStatusHistoryProjection.new(current_online_status).save!(validate: false)
      end
    end

    unless current_online_status.present? && current_online_status["status"] == "went_online"
      as_id = pod_metadata(pod_id)["autonomous_system_id"]
      network_metadata(location_id)["current_online_status"] = {
        "status" => "went_online",
        "location_id" => location_id,
        "started_at" => timestamp,
        "autonomous_system_id" => as_id
      }
    end
  end

  def handle_location_in_service(pod_id, location_id, timestamp)
    network_metadata(location_id)["in_service"] = true
    current_in_service_status = network_metadata(location_id)["current_in_service_status"]

    if current_in_service_status.present? && current_in_service_status["status"] == "not_in_service"
      current_in_service_status["finished_at"] = timestamp.to_time
      if current_in_service_status["id"].present?
        NetworkStatusHistoryProjection.where(id: current_in_service_status["id"]).update_all(current_in_service_status)
      else
        NetworkStatusHistoryProjection.new(current_in_service_status).save!(validate: false)
      end
    end

    unless current_in_service_status.present? && current_in_service_status["status"] == "went_in_service"
      as_id = pod_metadata(pod_id)["autonomous_system_id"]
      network_metadata(location_id)["current_in_service_status"] = {
        "status" => "went_in_service",
        "location_id" => location_id,
        "started_at" => timestamp,
        "autonomous_system_id" => as_id,
      }
    end
  end

  def handle_location_not_in_service(pod_id, location_id, timestamp)
    network_metadata(location_id)["in_service"] = false
    current_in_service_status = network_metadata(location_id)["current_in_service_status"]

    if current_in_service_status.present? && current_in_service_status["status"] == "went_in_service"
      current_in_service_status["finished_at"] = timestamp.to_time
      if current_in_service_status["id"].present?
        NetworkStatusHistoryProjection.where(id: current_in_service_status["id"]).update_all(current_in_service_status)
      else
        NetworkStatusHistoryProjection.new(current_in_service_status).save!(validate: false)
      end
    end

    unless current_in_service_status.present? && current_in_service_status["status"] == "not_in_service"
      as_id = pod_metadata(pod_id)["autonomous_system_id"]
      network_metadata(location_id)["current_in_service_status"] = {
        "status" => "not_in_service",
        "location_id" => location_id,
        "started_at" => timestamp,
        "autonomous_system_id" => as_id,
      }
    end
  end

  def handle_pod_service_started(pod_id, location_id, timestamp)
    current_online_projection = network_metadata(location_id)["current_online_status"]
    if current_online_projection.present? && current_online_projection["status"] == "went_offline" && current_online_projection["reason"] != "system_outage"
      current_online_projection["reason"] = "restarted"
      if current_online_projection["id"].present?
        NetworkStatusHistoryProjection.where(id: current_online_projection["id"]).update_all(current_online_projection)
      end
    else
      completed_offline = NetworkStatusHistoryProjection.went_offline.finished.where(
        location_id: location_id
      ).where.not(reason: "system_outage").where("finished_at > ?", timestamp - 1.minute).last
      if completed_offline.present?
        completed_offline.update(reason: :restarted)
      end
    end
  end

  def handle_pod_added_to_location(pod_id, location_id, timestamp)
    network_state = network_metadata(location_id)
    network_state["pods"] << pod_id

    if network_state["pods"].size == 1
      handle_location_in_service(pod_id, location_id, timestamp)
    end

    if !network_state["online"] && pod_metadata(pod_id)["online"]
      handle_location_online(pod_id, location_id, timestamp)
    end

    
  end

  def handle_pod_removed_from_location(pod_id, location_id, timestamp)
    network_state = network_metadata(location_id)
    network_state["pods"].delete(pod_id)

    if network_state["online"] && !network_state["pods"].any? {|id| pod_metadata(id)["online"]}
        handle_location_offline(pod_id, location_id, timestamp)
    end

    if network_state["pods"].size == 0
      handle_location_not_in_service(pod_id, location_id, timestamp)
    end
  end

  def network_metadata(location_id)
    @networks_metadata[location_id] ||= {
      "pods" => [],
      "online" => false
    }
  end

  def pod_metadata(pod_id)
    @pods_metadata[pod_id] ||= {
      "online" => false
    }
  end

end
