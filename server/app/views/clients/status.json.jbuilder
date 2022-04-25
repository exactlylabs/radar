json.extract! @client, :id, :unix_user, :name, :address, :public_key, :endpoint_host, :endpoint_port, :remote_gateway_port, :user_id, :pinged_at, :test_requested, :created_at, :updated_at
json.url client_url(@client.unix_user, format: :json)
if !@update_version.nil?
    json.update do
        json.version @update_version.version
        json.url url_for(@update_version.signed_binary)
    end
end
