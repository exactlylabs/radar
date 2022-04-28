json.extract! @measurement, :id, :style, :result, :client_id, :created_at, :updated_at
json.url client_measurements_url(@client.unix_user, format: :json)
json.result url_for(@measurement.result) if @measurement.result.attached?
