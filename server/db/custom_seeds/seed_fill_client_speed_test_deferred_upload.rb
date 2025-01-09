sql = %{
  UPDATE
      client_speed_tests
  SET
      deferred_upload = true
  WHERE
      download_avg IS NULL
      AND upload_avg IS NULL
}

ActiveRecord::Base.connection.execute(
  ApplicationRecord.sanitize_sql(
    [sql, {}]
  )
)