json.extract! client, :id, :unix_user, :name, :address, :public_key, :endpoint_host, :endpoint_port, :remote_gateway_port, :user_id, :created_at, :updated_at
json.url client_url(client.unix_user, format: :json)
json.secret @secret if @secret