json.extract! measurement, :id, :style, :result, :location_id, :created_at, :updated_at
json.url location_measurement_url(@location, measurement, format: :json)
json.result url_for(measurement.result) if measurement.result.attached?
