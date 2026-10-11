# The aggregated_* materialized views were refreshed in full every hour, rewriting
# ~35GB per refresh. They become plain tables that RefreshAggregatedMeasurementsJob
# updates for the latest buckets only. Current rows are copied over, so no recompute.
class ReplaceAggregatedMeasurementViewsWithTables < ActiveRecord::Migration[6.1]
  VIEWS = %w[
    aggregated_measurements_by_hours
    aggregated_measurements_by_days
    aggregated_pod_measurements_by_hours
    aggregated_pod_measurements_by_days
  ].freeze

  def up
    # The functions return the views' row types, so they have to go first.
    drop_functions

    VIEWS.each do |view|
      execute "CREATE TABLE #{view}_new AS SELECT * FROM #{view}"
      drop_view view, materialized: true
      rename_table "#{view}_new", view
    end
    add_table_indexes

    create_functions
  end

  def down
    drop_functions

    VIEWS.each do |view|
      drop_table view
      create_view view, version: 2, materialized: true
    end
    add_view_indexes

    create_functions
  end

  def add_table_indexes
    add_index :aggregated_measurements_by_hours, [:account_id, :autonomous_system_org_id, :location_id, :time], unique: true, name: "index_aggregated_measurements_by_hours_unique_id"
    add_index :aggregated_measurements_by_hours, [:account_id, :time], name: "index_aggregated_measurements_by_hours_on_account_id_and_time"
    add_index :aggregated_measurements_by_hours, :time
    add_index :aggregated_measurements_by_hours, :location_id

    add_index :aggregated_measurements_by_days, [:account_id, :autonomous_system_org_id, :location_id, :time], unique: true, name: "index_aggregated_measurements_by_days_unique_id"
    add_index :aggregated_measurements_by_days, [:account_id, :time], name: "index_aggregated_measurements_by_days_on_account_id_and_time"
    add_index :aggregated_measurements_by_days, :time
    add_index :aggregated_measurements_by_days, :location_id

    add_index :aggregated_pod_measurements_by_hours, [:account_id, :autonomous_system_org_id, :location_id, :client_id, :time], unique: true, name: "aggregated_pod_measurements_by_hours_unique_id"
    add_index :aggregated_pod_measurements_by_hours, :time
    add_index :aggregated_pod_measurements_by_hours, :location_id

    add_index :aggregated_pod_measurements_by_days, [:account_id, :autonomous_system_org_id, :location_id, :client_id, :time], unique: true, name: "aggregated_pod_measurements_by_days_unique_id"
    add_index :aggregated_pod_measurements_by_days, :time
    add_index :aggregated_pod_measurements_by_days, :location_id
  end

  def add_view_indexes
    add_index :aggregated_measurements_by_hours, [:account_id, :autonomous_system_org_id, :location_id, :time], unique: true, name: "index_aggregated_measurements_by_hours_unique_id"
    add_index :aggregated_measurements_by_hours, [:account_id, :time], name: "index_aggregated_measurements_by_hours_on_account_id_and_time"
    add_index :aggregated_measurements_by_days, [:account_id, :autonomous_system_org_id, :location_id, :time], unique: true, name: "index_aggregated_measurements_by_days_unique_id"
    add_index :aggregated_measurements_by_days, [:account_id, :time], name: "index_aggregated_measurements_by_days_on_account_id_and_time"
    add_index :aggregated_pod_measurements_by_hours, [:account_id, :autonomous_system_org_id, :location_id, :client_id, :time], unique: true, name: "aggregated_pod_measurements_by_hours_unique_id"
    add_index :aggregated_pod_measurements_by_days, [:account_id, :autonomous_system_org_id, :location_id, :client_id, :time], unique: true, name: "aggregated_pod_measurements_by_days_unique_id"
  end

  def drop_functions
    execute 'DROP FUNCTION IF EXISTS aggregated_measurements(start_at timestamp, end_at timestamp);'
    execute 'DROP FUNCTION IF EXISTS aggregated_pod_measurements(start_at timestamp, end_at timestamp);'
  end

  def create_functions
    execute %{
      CREATE OR REPLACE FUNCTION aggregated_measurements(start_at timestamp, end_at timestamp)
        RETURNS SETOF aggregated_measurements_by_days AS $$
        DECLARE
          tablename VARCHAR := 'aggregated_measurements_by_days';
        BEGIN
          IF end_at - start_at < INTERVAL '30d' THEN
            tablename = 'aggregated_measurements_by_hours';
          END IF;

          RETURN QUERY EXECUTE FORMAT('SELECT * FROM %I WHERE time BETWEEN $1 AND $2', tablename) USING start_at, end_at;
          RETURN;
        END;
      $$
      LANGUAGE plpgsql;
    }
    execute %{
      CREATE OR REPLACE FUNCTION aggregated_pod_measurements(start_at timestamp, end_at timestamp)
        RETURNS SETOF aggregated_pod_measurements_by_days AS $$
        DECLARE
          tablename VARCHAR := 'aggregated_pod_measurements_by_days';
        BEGIN
          IF end_at - start_at < INTERVAL '30d' THEN
            tablename = 'aggregated_pod_measurements_by_hours';
          END IF;

          RETURN QUERY EXECUTE FORMAT('SELECT * FROM %I WHERE time BETWEEN $1 AND $2', tablename) USING start_at, end_at;
          RETURN;
        END;
      $$
      LANGUAGE plpgsql;
    }
  end
end
