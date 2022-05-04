json.extract! @client, :id, :unix_user, :name, :address, :public_key, :endpoint_host, :endpoint_port, :remote_gateway_port, :user_id, :pinged_at, :created_at, :updated_at
json.test_requested @client.test_requested?
json.url client_url(@client.unix_user, format: :json)
if @client.has_update?
    json.update do
        json.version @client.update_group_version
        json.url url_for(@client.update_group_signed_binary)
    end
end
