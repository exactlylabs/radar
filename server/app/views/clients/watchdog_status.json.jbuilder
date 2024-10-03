json.extract! @client, :id, :unix_user, :name, :address, :public_key, :endpoint_host, :endpoint_port, :remote_gateway_port, :account_id, :pinged_at, :created_at, :updated_at
json.url client_url(@client.unix_user, format: :json)
if @account&.superaccount? && @client.has_watchdog_update?
    json.update do
        json.version @client.to_update_watchdog_version.version
        json.url download_watchdog_version_url(id: @client.to_update_watchdog_version.version, signed: true)
    end
end
