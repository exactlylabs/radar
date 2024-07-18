class AddMissingPrimaryKeys < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up do
        execute <<-SQL
          ALTER TABLE asn_ip_lookups ADD PRIMARY KEY (autonomous_system_id, ip, source_file_timestamp);
        SQL
      end
      dir.down do
        execute <<-SQL
          ALTER TABLE asn_ip_lookups DROP PRIMARY KEY;
        SQL
      end
    end
    add_column :autonomous_system_orgs_geospaces, :id, :primary_key
    add_column :feature_flags_users, :id, :primary_key
    add_column :geospaces_locations, :id, :primary_key
    add_column :metrics_projections, :id, :primary_key
  end
end
