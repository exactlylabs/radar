class OutagesProjector
  include Fetchers
  ##
  # This projector fill the outages projection, and classify them as:
  #  * Pod Failure
  #    - Location went offline
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
    ClientOutage.delete_all
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
    @state["isp_window_outages"] ||= {}
    @pods = @state["pods"]
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
      ClientOutage.where(
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

    case event["name"]
    when Client::Events::WENT_OFFLINE
      handle_offline_event(as_id, event)

    when Client::Events::WENT_ONLINE
      handle_online_event(as_id, event)

    when Client::Events::SERVICE_STARTED
      handle_service_started_event(as_id, event)

    end
  end

  def invalidate_isp_outage(isp_outage)
    # no longer valid isp outage
    isp_outage.update_columns(status: :cancelled)
    isp_outage.client_outages.each do |c_outage|
      c_outage.update_columns(outage_event_id: nil, accounted_in_isp_window: false)
      c_outage.outage_event = nil # update_columns won't delete the association by default
      if c_outage.resolved?
        # Run through the resolve logic again, to generate a different outage event
        resolve_client_outage(c_outage, c_outage.resolved_at)
      end
    end
    @state["isp_outages"].delete(isp_outage.autonomous_system_id)
  end

  def create_outage_event_for_client_outage(client_outage, outage_type, resolved_at)
    outage_event = OutageEvent.create!(
      outage_type: outage_type,
      status: :resolved,
      started_at: client_outage.started_at,
      autonomous_system_id: client_outage.autonomous_system_id,
      resolved_at: resolved_at
    )
    client_outage.update_columns(
      outage_event_id: outage_event.id,
      status: :resolved,
      resolved_at: resolved_at,
      accounted_in_isp_window: outage_type == :isp_outage
    )
  end

  ##
  #
  # Resolve a client outage, and create/update an OutageEvent depending on the rules:
  #
  #  - If the client outage has no existing outage event linked to it, it can be either a power_outage, or a pod_failure.
  #    We decide based on the value of has_service_started_event, which is set when processing SERVICE_STARTED events.
  #
  #  - If the client outage is linked to a pod_failure outage event, but it has the has_service_started_event flag set,
  #    we update it to power_outage type.
  #
  #  - If the client outage is linked to an isp_failure outage event, and it has the has_service_started_event flag set,
  #    then we remove it from the existing isp_failure, generate a power_outage event linked to it, and verify if the existing isp_failure outage is still valid
  #    by checking if it still has more than 3 client outages from the first 5 minutes window linked to it.
  #    If it doesn't, we cancel the isp_failure event, remove the link from all client outages linked to it, and update the resolved ones to pod_failure.
  #
  # - If the client outage is linked to an isp_failure outage event, and no has_service_started_event flag set,
  #   after resolving the client outage, we check if the isp_failure has a percentage of active client outages from the first 5 minutes window that is lower than 2/3 of the original value.
  #   If the condition checks, then we consider the isp_failure resolved.
  ##
  def resolve_client_outage(client_outage, resolved_at)
    if client_outage.outage_event.nil?
      create_outage_event_for_client_outage(
        client_outage,
        client_outage.has_service_started_event? ? :power_outage : :pod_failure,
        resolved_at
      )

    elsif client_outage.outage_event.pod_failure? && client_outage.has_service_started_event?
      client_outage.outage_event.update_columns(outage_type: :power_outage)

    elsif client_outage.outage_event.isp_outage? && client_outage.has_service_started_event?
      isp_outage = client_outage.outage_event
      create_outage_event_for_client_outage(
        client_outage,
        :power_outage,
        resolved_at
      )
      if isp_outage.client_outages.where(accounted_in_isp_window: true).count < 3
        invalidate_isp_outage(isp_outage)
      end

    elsif client_outage.outage_event.isp_outage?
      isp_outage = client_outage.outage_event
      client_outage.update_columns(status: :resolved, resolved_at: resolved_at)
      return unless isp_outage.active?
      cached_data = @state["isp_outages"][isp_outage.autonomous_system_id.to_s]
      cached_data["isp_window_count"] -= 1 if client_outage.accounted_in_isp_window

      if (cached_data["isp_window_count"].to_f / cached_data["isp_window_client_outages"].count.to_f) <= 2.0/3.0
        isp_outage.update_columns(status: :resolved, resolved_at: resolved_at)
        @state["isp_outages"].delete(isp_outage.autonomous_system_id.to_s)
      end
    end
  end

  def handle_service_started_event(as_id, event)
    # We use as_id as a key in the state hash, and we can end up with bugs because after the state is persisted in the DB,
    # it will be converted into a string.
    as_id = as_id.to_s
    client_outage = ClientOutage.active.where(
      client_id: event["aggregate_id"]
    ).first
    if client_outage.present?
      client_outage.update_columns(has_service_started_event: true)

    else
      # This can happen in two scenarios:
      #  - The pod service got restarted, but no offline event was recorded, therefore we do nothing.
      #  - The pod online event got processed already and now it is either a resolved pod_failure, or in a resolved isp_outage.
      #    - This is possible because they are two different events. For now, I'll pick the outage from the last minute to verify if we should undo something
      client_outage = ClientOutage.preload(:outage_event).resolved.where(
        client_id: event["aggregate_id"]
      ).where("resolved_at > ?", event["timestamp"] - 1.minute).last
      return unless client_outage.present?

      client_outage.update_columns(has_service_started_event: true)
      resolve_client_outage(client_outage, event["timestamp"])
    end
  end

  def handle_online_event(as_id, event)
    client_outage = ClientOutage.preload(:outage_event).active.find_by(client_id: event["aggregate_id"])
    self.resolve_client_outage(client_outage, event["timestamp"]) if client_outage.present?
  end

  ##
  #
  # Creates a ClientOutage record, and runs the following logic for ISP Outages:
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
  def handle_offline_event(as_id, event)
    return if @state["system_outage"] || event["snapshot_state"]["location_id"].nil?

    c_outage = ClientOutage.new(
      client_id: event["aggregate_id"],
      location_id: event["snapshot_state"]["location_id"],
      started_at: event["timestamp"],
      autonomous_system_id: as_id
    )
    c_outage.save!(validate: false)

    @state["isp_outages"] ||= {}
    @state["isp_outages"][as_id] ||= {}

    ongoing_isp_outage = @state["isp_outages"][as_id] if as_id.present?
    if as_id.present? && ongoing_isp_outage.blank?
      @state["isp_window_outages"][as_id] ||= []
      @state["isp_window_outages"][as_id] << {"id" => c_outage.id, "started_at" => c_outage.started_at, "location_id" => c_outage.location_id}
      @state["isp_window_outages"][as_id].delete_if { |o| o["started_at"] < (event["timestamp"].to_time - ISP_WINDOW) }

      distinct_locations = @state["isp_window_outages"][as_id].map { |o| o["location_id"] }.uniq
      return unless distinct_locations.count >= 3

      outage = OutageEvent.create(
        outage_type: :isp_outage,
        started_at: event["timestamp"],
        autonomous_system_id: as_id,
      )
      outage.save!(validate: false)
      @state["isp_outages"][as_id] = {
        "id" => outage.id,
        "started_at" => outage.started_at,
        "isp_window_client_outages" => @state["isp_window_outages"][as_id].dup,
        "isp_window_count" => distinct_locations.count
      }
      ClientOutage.where(
        id: @state["isp_window_outages"][as_id].map { |o| o["id"] }
      ).update_all(outage_event_id: outage.id, accounted_in_isp_window: true)

      @state["isp_window_outages"].delete(as_id)

    elsif as_id.present? && ongoing_isp_outage.present?
      # Account this outage in the ISP outages window if it is inside the time window, and the pod's location is not already accounted for.
      account_in_window = event["timestamp"] <= ongoing_isp_outage["started_at"].to_time + ISP_WINDOW && !c_outage.location_id.in?(ongoing_isp_outage["isp_window_client_outages"].map {|o| o["location_id"]})

      c_outage.update_columns(
        outage_event_id: ongoing_isp_outage["id"],
        accounted_in_isp_window: account_in_window
      )
      if account_in_window
        @state["isp_outages"][as_id]["isp_window_client_outages"] << {"id" => c_outage.id, "started_at" => c_outage.started_at, "location_id" => c_outage.location_id}
        @state["isp_outages"][as_id]["isp_window_count"] += 1
      end
    end
  end
end
