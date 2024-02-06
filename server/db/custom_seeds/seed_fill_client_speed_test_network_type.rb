sql = %{
  UPDATE
      client_speed_tests
  SET
      network_type = connection_data->>'connectionType',
      backfilled = true
  WHERE
      network_type IS NULL
      AND connection_data IS NOT NULL
      AND connection_data->'connectionType' IS NOT NULL
}

ActiveRecord::Base.connection.execute(
  ApplicationRecord.sanitize_sql(
    [sql, {}]
  )
)