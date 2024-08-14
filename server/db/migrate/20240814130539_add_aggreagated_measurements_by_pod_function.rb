class AddAggreagatedMeasurementsByPodFunction < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up do
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

      dir.down do
        execute 'DROP FUNCTION aggregated_pod_measurements(start_at timestamp, end_at timestamp);'
      end
    end
  end
end
