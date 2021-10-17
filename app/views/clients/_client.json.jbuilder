json.extract! client, :id, :client_id, :secret_hash, :name, :address, :public_key, :endpoint_host, :endpoint_port, :remote_gateway_port, :user_id, :created_at, :updated_at
json.url client_url(client, format: :json)
