class UpdateAggregatedMeasurementsByDaysToVersion2 < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up do
        self.drop_functions
      end
      dir.down do
        self.create_functions
      end
    end

    update_view :aggregated_measurements_by_days,
      version: 2,
      revert_to_version: 1,
      materialized: true
    update_view :aggregated_measurements_by_hours,
      version: 2,
      revert_to_version: 1,
      materialized: true
    update_view :aggregated_pod_measurements_by_hours,
      version: 2,
      revert_to_version: 1,
      materialized: true
    update_view :aggregated_pod_measurements_by_days,
      version: 2,
      revert_to_version: 1,
      materialized: true

    reversible do |dir|
      dir.up do
        self.create_functions
      end
      dir.down do
        self.drop_functions
      end
    end
  end

  def drop_functions
    execute 'DROP FUNCTION aggregated_measurements(start_at timestamp, end_at timestamp);'
    execute 'DROP FUNCTION aggregated_pod_measurements(start_at timestamp, end_at timestamp);'
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
