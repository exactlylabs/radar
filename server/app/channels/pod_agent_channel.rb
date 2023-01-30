class PodAgentChannel < ApplicationCable::Channel
  TEST_REQUESTED_STREAM_NAME = "agent_test_requested_"
  UPDATE_AVAILABLE_STREAM_NAME = "agent_new_update_"
  
  def subscribed
    stream_from self.class.test_requested_stream_name self.client
    stream_from self.class.update_available_stream_name self.client
  end

  def sync(data)
    # Action called by the agent, right after it has finished the connection + subscriptions setup
    # This syncs the current Client model with the data from the pod as well as checks if there are any outstanding speed test or updates
    # If there is, it publishes through the subscription a new test/update request
    data = HashWithIndifferentAccess.new data["payload"]
    self.client.reload
    self.client.raw_version = data[:version]
    self.client.distribution_name = data[:distribution]
    self.client.network_interfaces = data[:net_interfaces]
    self.client.os_version = data[:os_version]
    self.client.hardware_platform = data[:hardware_platform]
    

    if !data[:version].nil?
      # Check client Version Id
      version_ids = ClientVersion.where(version: data[:version]).pluck(:id)
      if version_ids.length == 0
        # No version found
        version_id = nil
      else
        # pluck returns an array
        version_id = version_ids[0]
      end
      self.client.client_version_id = version_id
    end
    self.client.save!
    if self.client.test_scheduled_at.nil?
      self.client.schedule_next_test!
    end
    if client.has_update? || client.has_watchdog_update?
      self.class.broadcast_update_available client, client.to_update_version, client.to_update_watchdog_version
    end
    if client.test_requested?
      self.class.broadcast_test_requested client
    end
  end

  def store_result(data)
    data = HashWithIndifferentAccess.new data["payload"]
    self.client.reload
    measurement = self.client.measurements.build(data["payload"])
    measurement.client = self.client
    measurement.client_version = self.client.raw_version
    measurement.client_distribution = self.client.distribution_name
    measurement.network_interfaces = self.client.network_interfaces
    measurement.account = self.client.account if self.client.account.present?
    measurement.location = self.client.location if self.client.location.present?
    measurement.ip = self.client.ip
    if self.client.test_requested
      self.client.schedule_next_test!
    end

    location = self.client.location
    if location && location.test_requested
        location.test_requested = false
        location.save
    end
    measurement.save
    ProcessMeasurementJob.perform_later measurement
  end

  def self.broadcast_test_requested(client)
    ActionCable.server.broadcast(self.test_requested_stream_name(client), {type: "test_requested", payload: {test_requested: true, id: client.id}})
  end

  def self.broadcast_update_available(client, client_version, watchdog_version)
    data = {}
    if client_version.present?
      data["client"] = {
        version: client_version,
        binary_url: client.to_update_signed_binary.url
      }
    end
    if watchdog_version.present?
      data["watchdog"] = {
        version: watchdog_version.version,
        binary_url: watchdog_version.signed_binary.url
      }
    end
    ActionCable.server.broadcast(self.update_available_stream_name(client), {type: "update_available", payload: {client: client_update, watchdog: watchdog_update}})
  end

  def self.test_requested_stream_name(client)
    "#{TEST_REQUESTED_STREAM_NAME}_#{client.unix_user}"
  end

  def self.update_available_stream_name(client)
    "#{UPDATE_AVAILABLE_STREAM_NAME}_#{client.unix_user}"
  end
end
