class PodAgentChannel < ApplicationCable::Channel
  def subscribed
    stream_from "agent_channel_#{self.client.unix_user}"
  end

  def sync(data)
    data = JSON.parse data
    self.client.raw_version = data[:version]
    self.client.distribution_name = data[:distribution]
    self.client.network_interfaces = JSON.parse(data[:network_interfaces]) unless data[:network_interfaces].nil?
    self.client.os_version = JSON.parse(data[:os_version]) unless data[:os_version].nil?
    self.client.hardware_platform = JSON.parse(data[:hardware_platform]) unless data[:hardware_platform].nil?
    self.client.save!

    if !params[:version].nil?
      # Check client Version Id
      version_ids = ClientVersion.where(version: params[:version]).pluck(:id)
      if version_ids.length == 0
        # No version found
        version_id = nil
      else
        # pluck returns an array
        version_id = version_ids[0]
      end
      @client.client_version_id = version_id
    end
    if @client.test_scheduled_at.nil?
      @client.schedule_next_test!
    end
  end
end
