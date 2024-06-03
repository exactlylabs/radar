class OutagesProjector
  include Fetchers
  ##
  # This projector fill the outages projection, and classify them as:
  #  * Unknown Reason
  #    - Location is offline (all pods within this location are offline), and it's not back online and not an ISP outage
  #
  #  * Network Failure
  #    - Location went offline (all pods within this location are offline), and brought back online without any other information
  #
  #  * ISP Outage
  #    - Multiple locations, on the same ISP going down
  #
  #  * Power Outage
  #    - Multiple Location that went offline and came online with a SERVICE_STARTED event
  #

  ISP_WINDOW = 5.minutes

  def self.reprocess
    ConsumerOffset.find_by(consumer_id: 'OutagesProjector')&.destroy
    NetworkOutage.delete_all
    OutageEvent.delete_all
    process
  end

  def self.process
    new.process
  end

  def initialize
    @co = ConsumerOffset.find_or_create_by!(consumer_id: 'OutagesProjector')
    @state = @co.state
    @state["pods"] ||= {}
    @state["network_pods"] ||= {}
    @state["isp_window_outages"] ||= {}
    @pods = @state["pods"]
    @network_pods = @state["network_pods"]
    @system_outage = @state["system_outage"] || false
  end

  def inspect
    "#<#{self.class.name}:#{self.object_id}>"
  end

  def process
    iterators = [
      self.events_iterator(Client, @state["client_events_offset"] || 0),
      self.events_iterator(SystemOutage, @state["sys_outage_events_offset"] || 0),
    ]

    self.sorted_iteration(iterators).each_slice(500) do |chunk|
      OutageEvent.transaction do
        chunk.each do |content|
          event = content[:data]
          case event["aggregate_type"]
          when Client.name
            @pods[event["aggregate_id"]] ||= {}
            handle_client_event(event)
            @pods[event["aggregate_id"]]["last_event"] = {name: event["name"], data: event["data"]}
            @state["client_events_offset"] = event["id"]
          when SystemOutage.name
            handle_system_outage_event(event)
            @state["sys_outage_events_offset"] = event["id"]
          end
        end
        @co.state = @state
        @co.save!
      end
    end
  end

  private

  def handle_system_outage_event(event)
    system_outage = event["snapshot_state"]

    case event["name"]
    when SystemOutage::Events::CREATED
      @state["system_outage"] = true

    when SystemOutage::Events::FINISHED
      @state["system_outage"] = false

      # Cancel any outage during this period
      OutageEvent.where(
        "started_at >= ? AND started_at < ?", system_outage["start_time"], system_outage["end_time"]
      ).update_all(status: :cancelled)
      NetworkOutage.where(
        "started_at >= ? AND started_at < ?", system_outage["start_time"], system_outage["end_time"]
      ).update_all(status: :cancelled)

    end
  end

  def handle_client_event(event)
    if event["snapshot_id"].nil?
      return
    end

    last_event = @pods[event["aggregate_id"]]["last_event"] || {}
    if last_event.present? && last_event["name"] == event["name"] && last_event["data"] == event["data"]
      return
    end

    pod_state = event["snapshot_state"]
    as_id = pod_state["autonomous_system_id"].to_s


    @pods[event["aggregate_id"]]["state"] = pod_state if pod_state["location_id"].present?

    case event["name"]
    when Client::Events::CREATED
      if pod_state["location_id"].present?
        @network_pods[pod_state["location_id"]] ||= []
        @network_pods[pod_state["location_id"]] << event["aggregate_id"]
      end
    when Client::Events::WENT_OFFLINE
      return if pod_state["location_id"].nil?
      handle_offline_event(as_id, pod_state, event)

    when Client::Events::WENT_ONLINE
      return if pod_state["location_id"].nil?
      handle_online_event(as_id, pod_state, event)

    when Client::Events::SERVICE_STARTED
      return if pod_state["location_id"].nil?
      handle_service_started_event(as_id, pod_state, event)

    when Client::Events::LOCATION_CHANGED
      handle_location_changed_event(as_id, pod_state, event)
    end
  end

  def invalidate_isp_outage(isp_outage, network_outages, cancelled_at)
    # no longer valid isp outage
    isp_outage.update_columns(status: :cancelled, cancelled_at: cancelled_at)
    network_outages.each do |n_outage|
      n_outage.accounted_in_isp_window = false
      n_outage.outage_event = OutageEvent.new(
        outage_type: :unknown_reason,
        started_at: n_outage.started_at,
        autonomous_system_id: n_outage.autonomous_system_id
      )
      if n_outage.resolved?
        # Run through the resolve logic again, to generate a different outage event
        resolve_network_outage(n_outage, n_outage.resolved_at)
      else
        n_outage.save!(validate: false)
      end
    end
    @state["isp_outages"].delete(isp_outage.autonomous_system_id)
  end


  ##
  #
  # Resolve a network outage, and create/update an OutageEvent depending on the rules:
  #
  #  - If the network outage is linked to a network_failure outage event, but it has the has_service_started_event flag set,
  #    we update it to power_outage type.
  #
  #  - If the network outage is linked to an isp_failure outage event, and it has the has_service_started_event flag set,
  #    then we remove it from the existing isp_failure, generate a power_outage event linked to it, and verify if the existing isp_failure outage is still valid
  #    by checking if it still has more than 3 network outages from the first 5 minutes window linked to it.
  #    If it doesn't, we cancel the isp_failure event, remove the link from all network outages linked to it, and update the resolved ones to network_failure.
  #
  # - If the network outage is linked to an isp_failure outage event, and no has_service_started_event flag set,
  #   after resolving the network outage, we check if the isp_failure has a percentage of active network outages from the first 5 minutes window that is lower than 2/3 of the original value.
  #   If the condition checks, then we consider the isp_failure resolved.
  ##
  def resolve_network_outage(network_outage, resolved_at)
    network_outage.status = :resolved
    network_outage.resolved_at = resolved_at

    if network_outage.outage_event.network_failure? && network_outage.has_service_started_event?
      network_outage.outage_event.update_columns(outage_type: :power_outage)

    elsif network_outage.outage_event.isp_outage? && network_outage.has_service_started_event?
      # Replace this NetworkOutage's OutageEvent to a Power Outage, and check if ISP outage still applies
      isp_outage = network_outage.outage_event
      outage_event = OutageEvent.create!(
        outage_type: :power_outage,
        status: :resolved,
        started_at: network_outage.started_at,
        autonomous_system_id: isp_outage.autonomous_system_id,
        resolved_at: resolved_at
      )
      network_outage.outage_event = outage_event

      remaining_networks = isp_outage.network_outages.except(network_outage)
      if remaining_networks.where(accounted_in_isp_window: true).count < 3
        invalidate_isp_outage(isp_outage, remaining_networks, resolved_at)
      end

    elsif network_outage.outage_event.isp_outage?
      # Verify if the ISP Outage should get resolved as well
      isp_outage = network_outage.outage_event
      return unless isp_outage.active?
      cached_data = @state["isp_outages"][isp_outage.autonomous_system_id.to_s]
      cached_data["isp_window_count"] -= 1 if network_outage.accounted_in_isp_window

      if (cached_data["isp_window_count"].to_f / cached_data["isp_window_network_outages"].count.to_f) <= 2.0/3.0
        isp_outage.update_columns(status: :resolved, resolved_at: resolved_at)
        @state["isp_outages"].delete(isp_outage.autonomous_system_id.to_s)
      end
    end
  ensure
    network_outage.save!(validate: false)
  end

  def handle_service_started_event(as_id, state, event)
    return if state["location_id"].nil?

    as_id = as_id.to_s # keys with this will get transformed into string, so I force it here to avoid mismatches
    network_outage = NetworkOutage.active.where(
      location_id: state["location_id"]
    ).first

    if network_outage.present?
      network_outage.update_columns(has_service_started_event: true)

    else
      # This can happen in two scenarios:
      #  - The pod service got restarted, but no offline event was recorded, therefore we do nothing.
      #  - The pod online event got processed already and now it is either a resolved network_failure, or in a resolved isp_outage.
      #    - This is possible because they are two different events. For now, I'll pick the outage from the last minute to verify if we should undo something
      network_outage = NetworkOutage.preload(:outage_event).resolved.where(
        location_id: state["location_id"]
      ).where("resolved_at > ?", event["timestamp"] - 1.minute).last
      return unless network_outage.present?

      network_outage.update_columns(has_service_started_event: true)
      resolve_network_outage(network_outage, event["timestamp"])
    end
  end

  def handle_online_event(as_id, state, event)
    network_outage = NetworkOutage.preload(:outage_event).active.find_by(location_id: state["location_id"])
    self.resolve_network_outage(network_outage, event["timestamp"]) if network_outage.present?
  end

  ##
  #
  # Creates a NetworkOutage record in case all pods in a network are offline, and runs the following logic for ISP Outages:
  #
  #   - If the client has an autonomous_system_id, and no ongoing ISP Outage,
  #     verify the number of client outages from that ISP in the last 5 minutes.
  #     If it is greater or equal to 3, create the isp_outage event, link the last 5 minutes client outages to it.
  #
  #   - If the client has an autonomous_system_id, and there is an ongoing ISP Outage,
  #     link this client outage to the ongoing isp_outage, and this outage happened within start of isp outage + Time window,
  #     then also mark this client outage as accounted_in_isp_window.
  #
  #
  ##
  def handle_offline_event(as_id, state, event)
    return if @state["system_outage"] || state["location_id"].nil?
    @network_pods[state["location_id"]] ||= []

    return if @network_pods[state["location_id"]].map { |pod_id| @pods[pod_id]["state"] }.any? { |pod| pod["online"] }
    return if NetworkOutage.active.find_by(location_id: state["location_id"]).present?

    network_outage = NetworkOutage.new(
      location_id: state["location_id"],
      started_at: event["timestamp"],
      autonomous_system_id: as_id,
    )
    network_outage.save!(validate: false) # Save to get an id
    process_new_network_outage(network_outage, event["timestamp"].to_time)
    network_outage.save!(validate: false)

  end

  def process_new_network_outage(network_outage, timestamp)
    as_id = network_outage.autonomous_system_id.to_s
    @state["isp_outages"] ||= {}
    @state["isp_outages"][as_id] ||= {}

    outage = OutageEvent.new(
      outage_type: :unknown_reason,
      started_at: network_outage.started_at,
      autonomous_system_id: network_outage.autonomous_system_id
    )
    network_outage.outage_event = outage

    ongoing_isp_outage = @state["isp_outages"][as_id] if as_id.present?
    if as_id.present? && ongoing_isp_outage.blank?
      @state["isp_window_outages"][as_id] ||= []
      @state["isp_window_outages"][as_id] << {"id" => network_outage.id, "started_at" => network_outage.started_at, "location_id" => network_outage.location_id}
      @state["isp_window_outages"][as_id].delete_if { |o| o["started_at"] < (timestamp.to_time - ISP_WINDOW) }

      distinct_locations = @state["isp_window_outages"][as_id].map { |o| o["location_id"] }.uniq
      if distinct_locations.count < 3
        return outage
      end

      outage.outage_type = :isp_outage
      outage.save!(validate: false)

      @state["isp_outages"][as_id] = {
        "id" => outage.id,
        "started_at" => outage.started_at,
        "isp_window_network_outages" => @state["isp_window_outages"][as_id].dup,
        "isp_window_count" => distinct_locations.count
      }
      NetworkOutage.where(
        id: @state["isp_window_outages"][as_id].map { |o| o["id"] }
      ).update_all(outage_event_id: outage.id, accounted_in_isp_window: true)

      @state["isp_window_outages"].delete(as_id)

      return outage

    elsif as_id.present? && ongoing_isp_outage.present?
      # Account this outage in the ISP outages window if it is inside the time window, and the pod's location is not already accounted for.
      account_in_window = timestamp <= ongoing_isp_outage["started_at"].to_time + ISP_WINDOW

      network_outage.outage_event_id = ongoing_isp_outage["id"]
      network_outage.accounted_in_isp_window = account_in_window

      if account_in_window
        @state["isp_outages"][as_id]["isp_window_network_outages"] << {"id" => network_outage.id, "started_at" => network_outage.started_at, "location_id" => network_outage.location_id}
        @state["isp_outages"][as_id]["isp_window_count"] += 1
      end
    end

    return outage
  end

  ##
  #
  # Register the move of a pod from one location to the other.
  # Deal with existing Network Outage in the pods' original location, and decide if it should be resolved or not.
  # It can also create a Network Outage in case of the network still have pods, but all are offline and there is no Network Outage yet.
  #
  ##
  def handle_location_changed_event(as_id, state, event)
    if event["data"]["to"].present?
      @network_pods[event["data"]["to"]] ||= []
      @network_pods[event["data"]["to"]] << event["aggregate_id"]
    end

    if event["data"]["from"].present?
      @network_pods[event["data"]["from"]]&.delete(event["aggregate_id"])
      remaining_pods = @network_pods[event["data"]["from"]]&.map { |pod_id| @pods[pod_id]["state"] } || []
      network_is_online = remaining_pods.any? { |pod| pod["online"] }

      active_outage = NetworkOutage.active.find_by(location_id: event["data"]["from"])

      if remaining_pods.empty? && active_outage.present?
        # Resolve it, this location is no longer in service.
        resolve_network_outage(active_outage, event["timestamp"])

      elsif remaining_pods.present? && !network_is_online && active_outage.blank?
        outage = OutageEvent.create!(
          outage_type: :unknown_reason,
          started_at: event["timestamp"],
          autonomous_system_id: as_id
        )
        network_outage = NetworkOutage.new(
          location_id: event["data"]["from"],
          started_at: event["timestamp"],
          autonomous_system_id: as_id,
          outage_event: outage
        )
        network_outage.save!(validate: false)
      end
    end
  end
end
