class PodAgentChannel < ApplicationCable::Channel
  def subscribed
    stream_from PodAgentChannel.agent_stream_name self.client
  end

  # Broadcasting Helpers

  def self.broadcast_test_requested(client)
    ActionCable.server.broadcast(
      PodAgentChannel.agent_stream_name(client),
      {event: "test_requested", payload: {
        interfaces: test_allowed_interfaces(client)
      }}
    )
  end

  def self.broadcast_version_changed(client)
    if client.has_update? && client.to_update_signed_binary.present?
      ActionCable.server.broadcast(
        PodAgentChannel.agent_stream_name(client),
        {
          event: "version_changed",
          payload: {
            version: client.target_client_version.version,
            binary_url: PodAgentChannel.blob_path(client.to_update_signed_binary),
          }
        }
      )
    end
  end

  def self.broadcast_watchdog_version_changed(client)
    if client.has_watchdog_update? && client.target_watchdog_version&.signed_binary.present?
      ActionCable.server.broadcast(
        PodAgentChannel.agent_stream_name(client),
        {
          event: "watchdog_version_changed",
          payload: {
            version: client.target_watchdog_version.version,
            binary_url: PodAgentChannel.blob_path(client.target_watchdog_version.signed_binary),
          }
        }
      )
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
    version_id = ClientVersion.where(version: data["version"]).pluck(:id).first
    watchdog_version_id = WatchdogVersion.where(version: data["watchdog_version"]).pluck(:id).first

    data["net_interfaces"].each do |interface|
      self.client.pod_network_interfaces.upsert({
        name: interface["name"],
        mac_address: interface["mac"],
        ips: interface["ips"],
        wireless: interface["is_wlan"],
        default: interface["default"],
      }, unique_by: [:client_id, :name], returning: nil)
    end

    self.client.update(
      raw_version:  data["version"],
      raw_watchdog_version: data["watchdog_version"],
      distribution_name: data["distribution"],
      network_interfaces: data["net_interfaces"],
      os_version: data["os_version"],
      hardware_platform: data["hardware_platform"],
      client_version_id: version_id,
      watchdog_version_id: watchdog_version_id,
    )
    if self.client.has_update?
      update
    end
    if self.client.has_watchdog_update?
      update_watchdog
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
        message: {
          "interfaces": self.class.test_allowed_interfaces(self.client)
        }
      }
    )
  end

  def update()
    distribution = self.client.to_update_distribution
    self.connection.transmit(
      {
        type: "update",
        message: {
          version: distribution.client_version.version,
          binary_url: Rails.application.routes.url_helpers.download_client_version_distribution_path(id: distribution.name, client_version_id: distribution.client_version.version, signed: true)
        },
      }
    ) if distribution.present?
  end

  def update_watchdog()
    self.connection.transmit(
      {
        type: "update_watchdog",
        message: {
          version: self.client.to_update_watchdog_version.version,
          binary_url: PodAgentChannel.blob_path(self.client.to_update_watchdog_signed_binary)
        },
      }
    ) if self.client.to_update_version.present?
  end

  # Streams

  def self.agent_stream_name(client)
    "agent_stream_#{client.unix_user}"
  end

  def self.test_allowed_interfaces(client)
    # Keep the original behavior when not a managed pod
    return nil unless client.has_watchdog?

    ifaces = [client.default_interface&.name] # Default route (We assume it's the wired interface -- eth0/enp4s0/etc...)
    return ifaces unless client.location.present?

    pod_conn = client.pod_connection
    if client.location.wlan_enabled? && client.location.wlan_selected_client_id == client.id && pod_conn.wlan_connected_with_internet?
      ifaces << client.wlan_interface.name unless client.wlan_interface.default
    end

    return ifaces
  end
end
