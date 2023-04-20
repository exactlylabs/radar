

sql = %{
  UPDATE measurements
  SET lonlat = locations.lonlat
  FROM locations
  WHERE measurements.location_id = locations.id
}

ActiveRecord::Base.connection.execute(
  ApplicationRecord.sanitize_sql(
    [sql, {}]
  )
)

sql = %{
  UPDATE client_speed_tests
  SET lonlat = ST_POINT(longitude, latitude)
}

ActiveRecord::Base.connection.execute(
  ApplicationRecord.sanitize_sql(
    [sql, {}]
  )
)