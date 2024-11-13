class AddUserToClientSpeedTest < ActiveRecord::Migration[6.1]
  def change
    add_reference :client_speed_tests, :user, foreign_key: true

    change_table :mobile_scan_networks do |t|
      t.string :state
      t.string :county
      t.string :city

      t.index :name
      t.index :lonlat, using: :gist
    end

    reversible do |dir|
      dir.up do
        execute "CREATE INDEX index_networks_lonlat_geometry ON mobile_scan_networks USING GIST(CAST(lonlat AS geometry))"
        execute "CREATE INDEX index_cli_speed_tests_lonlat_geometry ON client_speed_tests USING GIST(CAST(lonlat AS geometry))"
      end
      dir.down do
        execute "DROP INDEX index_networks_lonlat_geometry"
        execute "DROP INDEX index_cli_speed_tests_lonlat_geometry"
      end
    end
  end
end
