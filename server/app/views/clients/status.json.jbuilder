json.extract! @client, :id, :unix_user, :name, :address, :public_key, :endpoint_host, :endpoint_port, :remote_gateway_port, :account_id, :pinged_at, :created_at, :updated_at
json.test_requested @client.test_requested?
json.url client_url(@client.unix_user, format: :json)
if @client.has_update?
    json.update do
        json.version @client.to_update_version.version
        json.url url_for(@client.to_update_signed_binary)
    end
end
if @user && @user.superuser? && @client.has_watchdog_update?
    json.watchdog_update do
        json.version @client.to_update_watchdog_version.version
        json.url url_for(@client.to_update_watchdog_signed_binary)
    end
end