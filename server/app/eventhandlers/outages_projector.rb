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

  ISP_WINDOW = 3.minutes
  ISP_OUTAGE_INITIAL_THRESHOLD = 3

  def self.reprocess
    ConsumerOffset.find_by(consumer_id: 'OutagesProjector')&.destroy
    NetworkOutage.delete_all
    IspOutage.delete_all
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
      NetworkOutage.transaction do
        chunk.each do |content|
          event = content[:data]
          case event["aggregate_type"]
          when Client.name
            @pods[event["aggregate_id"].to_s] ||= {}
            handle_client_event(event)
            @pods[event["aggregate_id"].to_s]["last_event"] = {name: event["name"], data: event["data"]}
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

  def handle_system_outage_event(event)
    system_outage = event["snapshot_state"]

    case event["name"]
    when SystemOutage::Events::CREATED
      @state["system_outage"] = true

    when SystemOutage::Events::FINISHED
      @state["system_outage"] = false

      # Cancel any outage during this period
      IspOutage.where(
        "offline_window_start >= ? AND online_window_end < ?", system_outage["start_time"], system_outage["end_time"]
      ).each do |isp_outage|
        isp_outage.network_outages.update_all(
          status: :cancelled,
          cancelled_at: event["timestamp"]
        )
        isp_outage.update!(cancelled_at: Time.now)
      end
      NetworkOutage.where(
        "started_at >= ? AND started_at < ?", system_outage["start_time"], system_outage["end_time"]
      ).update_all(status: :cancelled)

    end
  end

  def handle_client_event(event)
    if event["snapshot_id"].nil?
      return
    end

    last_event = @pods[event["aggregate_id"].to_s]["last_event"] || {}
    if last_event.present? && last_event["name"] == event["name"] && last_event["data"] == event["data"]
      return
    end

    pod_state = event["snapshot_state"]


    @pods[event["aggregate_id"].to_s]["state"] = pod_state if pod_state["location_id"].present?

    case event["name"]
    when Client::Events::CREATED
      if pod_state["location_id"].present?
        @network_pods[pod_state["location_id"]] ||= []
        @network_pods[pod_state["location_id"]] << event["aggregate_id"]
      end
    when Client::Events::WENT_OFFLINE
      return if pod_state["location_id"].nil?
      t = Time.now
      handle_offline_event(pod_state, event)
      Rails.logger.info "Handle Offline Event finished in #{Time.now - t}"

    when Client::Events::WENT_ONLINE
      return if pod_state["location_id"].nil?
      t = Time.now
      handle_online_event(pod_state, event)
      Rails.logger.info "Handle Online Event finished in #{Time.now - t}"

    when Client::Events::SERVICE_STARTED
      return if pod_state["location_id"].nil?
      t = Time.now
      handle_service_started_event(pod_state, event)
      Rails.logger.info "Handle Service Created Event finished in #{Time.now - t}"
    when Client::Events::LOCATION_CHANGED
      t = Time.now
      handle_location_changed_event(pod_state, event)
      Rails.logger.info "Handle Location Changed Event finished in #{Time.now - t}"
    end
  end

  def handle_service_started_event(state, event)
    return if state["location_id"].nil?

    as_id = as_id.to_s
    network_outage = NetworkOutage.active.where(
      location_id: state["location_id"]
    ).first

    if network_outage.present?
      network_outage.update_columns(has_service_started_event: true)

    else
      # This can happen in the following scenarios:
      #  - The pod service got restarted, but no offline event was recorded, therefore we do nothing.
      #  - The pod online event got processed already and now it is either a resolved network_failure or isp_outage.
      #    - This is possible because they are two different events. To detect this, I'll search for an outage in the last minute for this location.
      network_outage = NetworkOutage.preload(:isp_outage).resolved.where(
        location_id: state["location_id"]
      ).where("resolved_at > ?", event["timestamp"] - 1.minute).last
      return unless network_outage.present?

      if network_outage.network_failure?
        network_outage.update_columns(
          outage_type: :power_outage,
        )
      elsif network_outage.isp_outage?
        isp_outage = network_outage.isp_outage
        network_outage.update_columns(
          outage_type: :power_outage,
          isp_outage_id: nil,
        )
        return if isp_outage.network_outages.count > ISP_OUTAGE_INITIAL_THRESHOLD
        
        # This ISP Outage isn't valid anymore. We drop it and update 
        # the network outages back to network_failures
        isp_outage.network_outages.update_all(
          outage_type: :network_failure,
          isp_outage_id: nil,
        )
        isp_outage.update(cancelled_at: Time.now)
      end
    end
  end

  def handle_online_event(state, event)
    network_outage = NetworkOutage.preload(:isp_outage).active.find_by(location_id: state["location_id"])
    return unless network_outage.present?

    network_outage.outage_type = network_outage.has_service_started_event? ? :power_outage : :network_failure
    network_outage.status = :resolved
    network_outage.resolved_at = event["timestamp"]
    network_outage.save!(validate: false)

    self.detect_isp_outage(network_outage) if network_outage.autonomous_system_id.present?
  end

  ##
  #
  # Creates a NetworkOutage record in case all pods in a network are offline
  #
  ##
  def handle_offline_event(state, event)
    return if @state["system_outage"] || state["location_id"].nil?
    @network_pods[state["location_id"]] ||= []
    return if @network_pods[state["location_id"]].map { |pod_id| @pods[pod_id.to_s]["state"] }.any? { |pod| pod["online"] }
    return if NetworkOutage.active.select(:id).find_by(location_id: state["location_id"]).present?

    as_id = state["autonomous_system_id"].to_s
    network_outage = NetworkOutage.new(
      outage_type: :unknown_reason,
      location_id: state["location_id"],
      started_at: event["timestamp"].to_time,
      autonomous_system_id: as_id,
    )
    network_outage.save!(validate: false)
  end

  ##
  #
  # Register the move of a pod from one location to the other.
  # Deal with existing Network Outage in the pods' original location, and decide if it should be resolved or not.
  # It can also create a Network Outage in case of the network still have pods, but all are offline and there is no Network Outage yet.
  #
  ##
  def handle_location_changed_event(state, event)
    if event["data"]["to"].present?
      @network_pods[event["data"]["to"]] ||= []
      @network_pods[event["data"]["to"]] << event["aggregate_id"]
    end

    if event["data"]["from"].present?
      @network_pods[event["data"]["from"]]&.delete(event["aggregate_id"])
      remaining_pods = @network_pods[event["data"]["from"]]&.map { |pod_id| @pods[pod_id.to_s]["state"] } || []
      network_is_online = remaining_pods.any? { |pod| pod["online"] }

      active_outage = NetworkOutage.active.find_by(location_id: event["data"]["from"])

      if remaining_pods.empty? && active_outage.present?
        # Resolve it, this location is no longer in service.
        active_outage.update_columns(
          outage_type: :unknown_reason,
          status: :resolved, 
          resolved_at: event["timestamp"]
        )

      elsif remaining_pods.present? && !network_is_online && active_outage.blank?
        network_outage = NetworkOutage.new(
          location_id: event["data"]["from"],
          started_at: event["timestamp"],
          outage_type: :unknown_reason
        )
        network_outage.save!(validate: false)
      end
    end
  end

  ##
  #
  # Detect ISP Outage
  # Searches for an existing ISP Outage, or tries to find a new one
  # by searching for networks that have similar offline and online events
  # and share the same ISP.
  #
  ##
  def detect_isp_outage(network_outage)  
    isp_outage = IspOutage.where(
      autonomous_system_id: network_outage.autonomous_system_id,
    ).where(
      "offline_window_start <= ? AND online_window_end >= ?",
      network_outage.started_at, network_outage.resolved_at,
    ).select(:id).first
    if isp_outage.present?
      network_outage.update_columns(
        outage_type: :isp_outage,
        isp_outage_id: isp_outage.id
      )
      return
    end
    
    offline_window_start = network_outage.started_at - (ISP_WINDOW / 2)
    offline_window_end = network_outage.started_at + (ISP_WINDOW / 2)
    online_window_start = network_outage.resolved_at - (ISP_WINDOW / 2)
    online_window_end = network_outage.resolved_at + (ISP_WINDOW / 2)
    sql = <<-SQL
      SELECT
        id
      FROM network_outages
      WHERE
        autonomous_system_id = ?
        AND outage_type = 1
        AND status = 2
        AND started_at >= ? AND started_at < ?
        AND resolved_at >= ? AND resolved_at < ?
      GROUP BY id
    SQL
    grouped_networks = ActiveRecord::Base.connection.execute(
      ActiveRecord::Base.sanitize_sql([
        sql, network_outage.autonomous_system_id, offline_window_start, 
        offline_window_end, online_window_start, online_window_end
      ])
    )
    
    if grouped_networks.count > ISP_OUTAGE_INITIAL_THRESHOLD
      isp_outage = IspOutage.create!(
        autonomous_system_id: network_outage.autonomous_system_id,
        offline_window_start: offline_window_start,
        offline_window_end: offline_window_end,
        online_window_start: online_window_start,
        online_window_end: online_window_end,
      )
      NetworkOutage.where(id: grouped_networks).update_all(
        outage_type: :isp_outage,
        isp_outage_id: isp_outage.id,
      )
    end
  end
end
