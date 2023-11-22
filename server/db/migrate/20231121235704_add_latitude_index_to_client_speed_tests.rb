class AddLatitudeIndexToClientSpeedTests < ActiveRecord::Migration[6.1]
  def up
    execute("CREATE INDEX client_speed_tests_latitude_idx ON client_speed_tests (latitude ASC);")
    execute("CREATE INDEX client_speed_tests_gist_lonlat_idx ON client_speed_tests USING GIST(lonlat);")
  end

  def down
    execute("DROP INDEX client_speed_tests_latitude_idx;")
    execute("DROP INDEX client_speed_tests_gist_lonlat_idx;")
  end
end
