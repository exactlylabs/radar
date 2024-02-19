module DashboardHelper
  def location_filter_name_to_human(param)
    case param
    when 'active'
      'Active locations'
    when 'inactive'
      'Inactive locations'
    else
      'All locations'
    end
  end

  def get_custom_date_range_label(params)
    start_date = Time.at(params[:start].to_i / 1000)
    end_date = Time.at(params[:end].to_i / 1000)
    return "#{start_date.strftime('%b %d')} - #{end_date.strftime('%b %d')}" if start_date.year == end_date.year
    "#{start_date.strftime('%b %d, %Y')} - #{end_date.strftime('%b %d, %Y')}"
  end

  def self.get_online_pods_sql(interval_type, from, to, account_ids, as_org_ids: nil, location_ids: nil)
    sql = %{
      with base_series AS (
            SELECT
              date_trunc(:interval_type, dd) as "time"
            FROM generate_series(:from, :to, CONCAT('1 ', :interval_type)::interval) dd
      ),
          filtered_dimensions AS (
            SELECT
              online_client_count_projections.id,
              SUM(incr) OVER (ORDER BY "timestamp") as total_online,
              "timestamp" as "time"

            FROM online_client_count_projections
            LEFT JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
            LEFT JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
            WHERE
              account_id IN (:account_ids)
    }
    sql += " AND autonomous_system_orgs.id IN (:as_org_ids)" if as_org_ids.present?
    sql += " AND location_id IN (:location_ids)" if location_ids.present?
    sql += %{
      ),
        time_filtered AS (
          SELECT * FROM filtered_dimensions
          WHERE "time" BETWEEN :from AND :to
          ORDER BY "time" ASC
      ),
        initial AS (
          SELECT :from::timestamp as "time", total_online
            FROM filtered_dimensions
            WHERE "time" < :from
            ORDER BY "time", id DESC LIMIT 1
      ),
        table_with_initial AS (
          SELECT * FROM initial

          UNION

          SELECT "time", NULL as total_online FROM base_series

          UNION

          SELECT "time", total_online
          FROM time_filtered
      ),
        completed_table AS (
          SELECT
            "time",
            COALESCE(total_online, FIRST_VALUE(total_online) OVER (PARTITION BY non_null_count ORDER BY "time")) as "total_online"
          FROM (
            SELECT *, COUNT(total_online) OVER (ORDER BY "time") as non_null_count
            FROM table_with_initial
          ) t
      )

      SELECT EXTRACT(EPOCH FROM "time") * 1000 as x, COALESCE(total_online, 0) as y FROM completed_table ORDER BY time ASC
    }
    ActiveRecord::Base.sanitize_sql([sql, {interval_type: interval_type, account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to}])
  end

  def self.get_download_speed_sql(account_ids, from, to, as_org_ids: nil, location_ids: nil)
    sql = %{
      SELECT
          EXTRACT(EPOCH FROM time) * 1000 as x,
          MAX(download_max) as "#9138e5",
          percentile_disc(0.5) WITHIN GROUP (ORDER BY download_median) as "#4b7be5",
          MIN(download_min) AS "#ff695d"
      FROM aggregated_measurements(:from::timestamp, :to::timestamp)
      WHERE
          account_id IN (:account_ids)
    }
    sql += " AND autonomous_system_org_id IN (:as_org_ids)" if as_org_ids.present?
    sql += " AND location_id IN (:location_ids)" if location_ids.present?

    sql += %{
      GROUP BY 1
      ORDER BY EXTRACT(EPOCH FROM "time") * 1000 ASC;
    }
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to}])
  end

  def self.get_upload_speed_sql(account_ids, from, to, as_org_ids: nil, location_ids: nil)
    sql = %{
      SELECT
          EXTRACT(EPOCH FROM time) * 1000 as x,
          MAX(upload_max) as "#9138e5",
          percentile_disc(0.5) WITHIN GROUP (ORDER BY upload_median) as "#4b7be5",
          MIN(upload_min) AS "#ff695d"
      FROM aggregated_measurements(:from::timestamp, :to::timestamp)
      WHERE
        account_id IN (:account_ids)
    }
    sql += " AND autonomous_system_org_id IN (:as_org_ids)" if as_org_ids.present?
    sql += " AND location_id IN (:location_ids)" if location_ids.present?
    sql += %{
      GROUP BY 1
      ORDER BY EXTRACT(EPOCH FROM "time") * 1000 ASC;
    }
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to}])
  end

  def self.get_latency_sql(account_ids, from, to, as_org_ids: nil, location_ids: nil)
    sql = %{
      SELECT
          EXTRACT(EPOCH FROM time) * 1000 as x,
          MAX(latency_max) as "#9138e5",
          percentile_disc(0.5) WITHIN GROUP (ORDER BY latency_median) as "#4b7be5",
          MIN(latency_min) AS "#ff695d"
      FROM aggregated_measurements(:from::timestamp, :to::timestamp)
      WHERE
        account_id IN (:account_ids)
    }
    sql += " AND autonomous_system_org_id IN (:as_org_ids)" if as_org_ids.present?
    sql += " AND location_id IN (:location_ids)" if location_ids.present?
    sql += %{
      GROUP BY 1
      ORDER BY EXTRACT(EPOCH FROM "time") * 1000 ASC;
    }
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to}])
  end

  def self.get_usage_sql(interval_type, from, to, account_ids, as_org_ids: nil, location_ids: nil)
    sql = %{
      WITH data_used_per_day AS (
        SELECT
          date_trunc(:interval_type, processed_at) as "time",
          SUM(measurements.download_total_bytes) + SUM(measurements.upload_total_bytes) AS "total"
        FROM measurements
        JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
        JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
        WHERE
          processed_at BETWEEN :from AND :to
          AND account_id IN (:account_ids)
      }
    sql += " AND autonomous_system_orgs.id IN (:as_org_ids)" if as_org_ids.present?
    sql += " AND location_id IN (:location_ids)" if location_ids.present?

    sql += %{
        GROUP BY 1
        ORDER BY 1 ASC
      )
      SELECT total as y, EXTRACT(EPOCH FROM time) * 1000 as x FROM data_used_per_day ORDER BY time ASC;
    }
    ActiveRecord::Base.sanitize_sql([sql, {interval_type: interval_type, account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to}])
  end

  def self.get_as_orgs_sql(account_ids, from, to, location_ids: nil)
    sql = %{
      SELECT DISTINCT as_org.name as name, as_org.id as id
      FROM aggregated_measurements(:from::timestamp, :to::timestamp) t
      JOIN autonomous_system_orgs as_org ON autonomous_system_org_id = as_org.id
      WHERE
      t.account_id IN (:account_ids)
    }
    sql += " AND location_id IN (:location_ids)" if location_ids.present?
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, from: from, to: to, location_ids: location_ids}])
  end

end
