class PodAgentChannel < ApplicationCable::Channel  
  def subscribed
    stream_from PodAgentChannel.agent_stream_name self.client
  end

  # Broadcasting Helpers

  def self.broadcast_test_requested(client)
    ActionCable.server.broadcast(
      PodAgentChannel.agent_stream_name(client), 
      {event: "test_requested", payload: {}}
    )
  end

  def self.broadcast_update_group_version_changed(update_group)
    # Broadcast an update for each client
    update_group.clients.each do |client|
      if client.has_update?
        ActionCable.server.broadcast(
          PodAgentChannel.agent_stream_name(client), 
          {
            event: "version_changed",
            payload: {
              version: update_group.client_version.version,
              binary_url: PodAgentChannel.blob_path(client.to_update_signed_binary),
            }
          }
        )
      end
    end
  end

  def self.broadcast_client_update_group_changed(client)
    if client.has_update?
      ActionCable.server.broadcast(
        PodAgentChannel.agent_stream_name(client), 
        {
          event: "version_changed",
          payload: {
            version: client.update_group.client_version.version,
            binary_url: PodAgentChannel.blob_path(client.to_update_signed_binary),
          }
        }
      )
    end
  end
  

  # Actions called by the client'

  def sync(data)
    # Updates the data in the DB for this pod and starts the stream subscriptions
    # Action called by the agent, right after it has finished the connection + subscriptions setup
    # This syncs the current Client model with the data from the pod as well as checks if there are any outstanding speed test or updates
    # If there is, it publishes through the subscription a new test/update request
    data = data["payload"]
    # Check client Version Id
    version_ids = ClientVersion.where(version: data["version"]).pluck(:id)
    if version_ids.length == 0
      # No version found
      version_id = nil
    else
      # pluck returns an array
      version_id = version_ids[0]
    end
    self.client.update(
      raw_version:  data["version"],
      distribution_name: data["distribution"],
      network_interfaces: data["net_interfaces"],
      os_version: data["os_version"],
      hardware_platform: data["hardware_platform"],
      client_version_id: version_id,
    )
    if self.client.has_update?
      update
    end
    if self.client.test_requested?
      run_test
    end
  end

  def pong(data)
    self.client.compute_ping!
  end

  private

  # Commands to the client -- Called only during the sync process at the beginning of the connection

  def run_test()
    self.connection.transmit(
      {
        type: "run_test",
      }
    )
  end

  def update()
    self.connection.transmit(
      {
        type: "update",
        message: {
          version: self.client.to_update_version.version,
          binary_url: PodAgentChannel.blob_path(self.client.to_update_signed_binary)
        },
      }
    )
  end

  # Streams

  def self.agent_stream_name(client)
    "agent_stream_#{client.unix_user}"
  end

end
