json.extract! location, :id, :name, :address, :latitude, :longitude, :user_id, :created_at, :updated_at
json.url location_url(location, format: :json)
