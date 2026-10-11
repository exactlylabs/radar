# Keeps the aggregated_* measurement tables up to date.
#
# These used to be materialized views refreshed in full every hour, which recomputed
# every bucket since 2021 to pick up the few hundred measurements of the last hour.
# A measurement lands in the bucket of its processed_at, which is set once when it is
# processed, so only the latest buckets change. Each run recomputes from one bucket
# before the newest stored one (to catch rows committed just after the previous run),
# which also catches up on its own if runs were missed.
class RefreshAggregatedMeasurementsJob < ProjectionJob
  queue_as :default

  TABLES = {
    "aggregated_measurements_by_hours" => { unit: "hour", extra_keys: [] },
    "aggregated_measurements_by_days" => { unit: "day", extra_keys: [] },
    "aggregated_pod_measurements_by_hours" => { unit: "hour", extra_keys: ["client_id"] },
    "aggregated_pod_measurements_by_days" => { unit: "day", extra_keys: ["client_id"] },
  }.freeze

  def perform()
    self.class.refresh_recent!
  end

  def self.refresh_recent!
    TABLES.each do |table, config|
      replace!(table, config) do |conn|
        # As text so the timestamp round-trips without Rails time zone conversion.
        cutoff = conn.select_value("SELECT (MAX(time) - INTERVAL '1 #{config[:unit]}')::text FROM #{table}")
        next ["TRUE", "TRUE"] if cutoff.nil?
        cutoff = "#{conn.quote(cutoff)}::timestamp"
        ["time >= #{cutoff}", "measurements.processed_at >= #{cutoff}"]
      end
    end
  end

  # Rewrites every bucket of a location, for when its past measurements change
  # (e.g. MeasurementMigrationJob moving them to another account).
  def self.rebuild_location!(location_id)
    id = Integer(location_id)
    TABLES.each do |table, config|
      replace!(table, config) { ["location_id = #{id}", "measurements.location_id = #{id}"] }
    end
  end

  # Full recompute. Expensive: only for repairs, e.g. after autonomous systems change org.
  def self.rebuild_all!
    TABLES.each do |table, config|
      replace!(table, config) { ["TRUE", "TRUE"] }
    end
  end

  # The block returns [stored rows to delete, measurements to aggregate in their place].
  # Both must select the same buckets.
  def self.replace!(table, config)
    keys = ["account_id", "autonomous_system_org_id", "location_id"] + config[:extra_keys]
    key_selects = keys.map { |k| k == "autonomous_system_org_id" ? "autonomous_systems.#{k}" : "measurements.#{k}" }

    ActiveRecord::Base.transaction do
      conn = ActiveRecord::Base.connection
      # Serializes recent refreshes and location rebuilds of the same table, which would
      # otherwise both insert the rows they overlap on.
      conn.execute("SELECT pg_advisory_xact_lock(hashtext(#{conn.quote(table)}))")
      stored_filter, measurements_filter = yield(conn)

      conn.execute("DELETE FROM #{table} WHERE #{stored_filter}")
      conn.execute(<<~SQL)
        INSERT INTO #{table} (time, #{keys.join(", ")}, download_median, download_min, download_max, upload_median, upload_min, upload_max, latency_median, latency_min, latency_max, download_total_bytes, upload_total_bytes)
        SELECT
          date_trunc('#{config[:unit]}', measurements.processed_at),
          #{key_selects.join(", ")},
          percentile_disc(0.5) WITHIN GROUP (ORDER BY download),
          MIN(download),
          MAX(download),
          percentile_disc(0.5) WITHIN GROUP (ORDER BY upload),
          MIN(upload),
          MAX(upload),
          percentile_disc(0.5) WITHIN GROUP (ORDER BY latency),
          MIN(latency),
          MAX(latency),
          SUM(download_total_bytes),
          SUM(upload_total_bytes)
        FROM measurements
        LEFT JOIN autonomous_systems ON autonomous_systems.id = measurements.autonomous_system_id
        WHERE download >= 0 AND upload >= 0 AND #{measurements_filter}
        GROUP BY #{(1..keys.size + 1).to_a.join(", ")}
      SQL
    end
  end
end
