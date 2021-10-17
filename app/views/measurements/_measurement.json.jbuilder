json.extract! measurement, :id, :style, :result, :client_id, :created_at, :updated_at
json.url measurement_url(measurement, format: :json)
json.result url_for(measurement.result)
