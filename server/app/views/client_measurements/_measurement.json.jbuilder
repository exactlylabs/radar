json.extract! measurement, :id, :style, :result, :client_id, :created_at, :updated_at
json.url client_measurement_url(@client.unix_user, measurement, format: :json)
json.result url_for(measurement.result) if measurement.result.attached?
