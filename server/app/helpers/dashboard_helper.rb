module DashboardHelper

  DOT_LIMIT = 500
  DOT_MINIMUM = 100

  def get_time_duration(duration)
    duration_parts = ActiveSupport::Duration.build(duration.to_i).parts
    duration_keys = duration_parts.keys.map(&:to_s)
    duration_values = duration_parts.values.map(&:to_i)
    str = "#{duration_values.first}#{duration_keys.first[0]}"
    if duration_keys.count > 1
      str += " #{duration_values.second}#{duration_keys.second[0]}"
    end
    str
  end

  def outage_type_to_human(outage_type)
    case outage_type
    when 'isp_outage'
      'ISP outage'
    when 'network_failure'
      'Network outage'
    when 'power_outage'
      'Power outage'
    when 'unknown_reason'
      'Ongoing outage'
    end
  end

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

  def self.get_online_pods_sql(from, to, account_ids, as_org_ids: nil, location_ids: nil)

    time_series_step, interval_type = self.get_interval_step(from, to)

    seconds_from_step = time_series_step.to_i.send(interval_type).in_seconds

    sql = %{
      with base_series AS (
            SELECT
              date_trunc(:interval_type, dd) as "time"
            FROM generate_series(:from, :to, CONCAT(:step, :interval_type)::interval) dd
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
          SELECT MIN(total_online) as total_online, time FROM (
            SELECT MIN(total_online) OVER
              (
                PARTITION BY TO_TIMESTAMP(
                                            FLOOR(
                                                (EXTRACT(EPOCH FROM time) - EXTRACT(EPOCH FROM (SELECT time FROM base_series ORDER BY time ASC LIMIT 1))) / :seconds_from_step
                                            ) * :seconds_from_step
                                            + EXTRACT(EPOCH FROM (SELECT time FROM base_series ORDER BY time LIMIT 1))) ORDER BY time
                ) AS total_online,
                TO_TIMESTAMP(
                  FLOOR(
                    (EXTRACT(EPOCH FROM time) - EXTRACT(EPOCH FROM (SELECT time FROM base_series ORDER BY time ASC LIMIT 1))) / :seconds_from_step) * :seconds_from_step
                  + EXTRACT(EPOCH FROM (SELECT time FROM base_series ORDER BY time LIMIT 1))
                ) AS time
            FROM filtered_dimensions
            WHERE "time" BETWEEN :from AND :to
            ORDER BY "time" ASC
        ) last_values
        GROUP BY time
      ),
        initial AS (
          SELECT (SELECT time FROM base_series ORDER BY time LIMIT 1) as "time", total_online
          FROM filtered_dimensions
          WHERE "time" < (SELECT time FROM base_series ORDER BY time LIMIT 1)
          ORDER BY "time", id DESC
          LIMIT 1
      ),
        table_with_initial AS (
          SELECT * FROM initial
          UNION
          SELECT "time", NULL as total_online FROM base_series
          UNION
          SELECT "time", total_online
          FROM time_filtered
          ORDER BY 1, 2
      ),
        completed_table AS (
          SELECT
            "time",
            COALESCE(total_online, FIRST_VALUE(total_online) OVER (PARTITION BY non_null_count ORDER BY "time")) as "total_online"
          FROM (
            SELECT *, COUNT(total_online) OVER (ORDER BY "time") as non_null_count
            FROM table_with_initial
            ORDER BY 1, 2
          ) t
      )

      SELECT EXTRACT(EPOCH FROM "time") * 1000 as x, COALESCE(total_online, 0) as y FROM completed_table GROUP BY "time", "total_online" ORDER BY time ASC
    }
    ActiveRecord::Base.sanitize_sql([sql, {seconds_from_step: seconds_from_step, step: time_series_step, interval_type: interval_type, account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to}])
  end

  def self.get_interval_unit(to, from)
    interval_unit = 'day'
    interval = to - from
    if interval < 30.days
      interval_unit = 'hour'
    end
    interval_unit
  end

  def self.get_download_speed_sql(account_ids, from, to, as_org_ids: nil, location_ids: nil)
    sql = self.get_base_series_sql("download", as_org_ids, location_ids)
    ActiveRecord::Base.sanitize_sql([sql, {interval_unit: self.get_interval_unit(to, from), account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to}])
  end

  def self.get_pod_download_speed_sql(pod_id, from, to, pod_account_id)
    sql = self.get_base_series_sql("download", nil, nil, pod_id)
    ActiveRecord::Base.sanitize_sql([sql, {interval_unit: self.get_interval_unit(to, from), account_ids: [pod_account_id], pod_id: pod_id, from: from, to: to}])
  end

  def self.get_compare_download_speed_sql(from, to, compare_by = 'account', curve_type = 'median', account_ids = nil, as_org_ids = nil, network_ids = nil, pod_ids = nil, category_names = nil)
    sql = get_comparison_speed_sql(compare_by, curve_type, 'download')
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, as_org_ids: as_org_ids, network_ids: network_ids, pod_ids: pod_ids, category_names: category_names, from: from, to: to}])
  end

  def self.get_upload_speed_sql(account_ids, from, to, as_org_ids: nil, location_ids: nil)
    sql = self.get_base_series_sql("upload", as_org_ids, location_ids)
    ActiveRecord::Base.sanitize_sql([sql, {interval_unit: self.get_interval_unit(to, from), account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to}])
  end

  def self.get_pod_upload_speed_sql(pod_id, from, to, pod_account_id)
    sql = self.get_base_series_sql("upload", nil, nil, pod_id)
    ActiveRecord::Base.sanitize_sql([sql, {interval_unit: self.get_interval_unit(to, from), account_ids: [pod_account_id], pod_id: pod_id, from: from, to: to}])
  end

  def self.get_compare_upload_speed_sql(from, to, compare_by = 'account', curve_type = 'median', account_ids = nil, as_org_ids = nil, network_ids = nil, pod_ids = nil, category_names = nil)
    sql = get_comparison_speed_sql(compare_by, curve_type, 'upload')
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, as_org_ids: as_org_ids, network_ids: network_ids, pod_ids: pod_ids, category_names: category_names, from: from, to: to}])
  end

  def self.get_latency_sql(account_ids, from, to, as_org_ids: nil, location_ids: nil)
    sql = self.get_base_series_sql("latency", as_org_ids, location_ids)
    ActiveRecord::Base.sanitize_sql([sql, {interval_unit: self.get_interval_unit(to, from), account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to}])
  end

  def self.get_pod_latency_sql(pod_id, from, to, pod_account_id)
    sql = self.get_base_series_sql("upload", nil, nil, pod_id)
    ActiveRecord::Base.sanitize_sql([sql, {interval_unit: self.get_interval_unit(to, from), account_ids: [pod_account_id], pod_id: pod_id, from: from, to: to}])
  end

  def self.get_compare_latency_sql(from, to, compare_by = 'account', curve_type = 'median', account_ids = nil, as_org_ids = nil, network_ids = nil, pod_ids = nil, category_names = nil)
    sql = get_comparison_speed_sql(compare_by, curve_type, 'latency')
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, as_org_ids: as_org_ids, network_ids: network_ids, pod_ids: pod_ids, category_names: category_names, from: from, to: to}])
  end

  def self.get_usage_sql(interval_type, from, to, account_ids, as_org_ids: nil, location_ids: nil)
    sql = %{
    WITH timeseries AS (
      SELECT extract(EPOCH FROM generate_series) * 1000 as "step"
      FROM generate_series(:from::date, :to::date, CONCAT('1 ', :interval_type)::interval)
    ),
    data_used_per_day AS (
        SELECT
          EXTRACT(EPOCH FROM date_trunc(:interval_type, processed_at)) * 1000 as "time",
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
      SELECT COALESCE(total, 0) AS y, step AS x from timeseries
      LEFT JOIN data_used_per_day ON timeseries.step = time
      ORDER BY x ASC;
    }
    ActiveRecord::Base.sanitize_sql([sql, {interval_type: interval_type, account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to}])
  end

  def self.get_pod_usage_sql(pod_id, from, to, account_id)
    sql = %{
      WITH data_used_per_day AS (
        SELECT
          date_trunc('d', processed_at) as "time",
          SUM(measurements.download_total_bytes) + SUM(measurements.upload_total_bytes) AS "total"
        FROM measurements
        INNER JOIN clients ON client_id = clients.id
        WHERE
          processed_at BETWEEN :from AND :to
          AND client_id = :pod_id
          AND measurements.account_id = :account_id
        GROUP BY 1
        ORDER BY 1 ASC
      )
      SELECT total as y, EXTRACT(EPOCH FROM time) * 1000 as x FROM data_used_per_day ORDER BY time ASC;
      }
    ActiveRecord::Base.sanitize_sql([sql, {pod_id: pod_id, account_id: account_id, from: from, to: to}])
  end

  def self.get_compare_data_usage_sql(from, to, compare_by = 'account', curve_type = 'median', account_ids = nil, as_org_ids = nil, network_ids = nil, pod_ids = nil, category_names = nil)
    sql = self.get_comparison_speed_sql(compare_by, curve_type, 'SUM(measurements.download_total_bytes) + SUM(measurements.upload_total_bytes)')
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, as_org_ids: as_org_ids, network_ids: network_ids, pod_ids: pod_ids, category_names: category_names, from: from, to: to}])
  end

  def self.get_total_data_amount_sql(from, to, account_ids)
    sql = %{
      SELECT SUM(measurements.download_total_bytes) + SUM(measurements.upload_total_bytes) as "y"
      FROM measurements
      WHERE processed_at BETWEEN :from AND :to
      AND account_id IN (:account_ids)
    }
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, from: from, to: to}])
  end

  def self.get_total_data_sql(from, to, account_ids, as_org_ids: nil, location_ids: nil, limit: nil, query: nil)
    sql = %{
      with with_measurements AS (
        SELECT
          COALESCE(SUM(m.download_total_bytes) + SUM(m.upload_total_bytes), 0) AS "y",
          l.name AS "name"
        FROM measurements AS m
          JOIN locations AS l ON l.id = m.location_id
          LEFT OUTER JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
          LEFT OUTER JOIN autonomous_system_orgs
          ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
        WHERE processed_at BETWEEN :from AND :to
        AND l.deleted_at IS NULL
        AND m.account_id IN (:account_ids)
    }

    sql += " AND autonomous_system_orgs.id IN (:as_org_ids) " if as_org_ids.present?
    sql += " AND location_id IN (:location_ids) " if location_ids.present?
    sql += " AND l.name ILIKE :query " if query.present?

    sql += " GROUP BY l.name ), "

    sql += %{
       with_no_measurements AS (
          SELECT DISTINCT 0 AS "y", l.name AS "name", m.id
          FROM locations AS l
          LEFT JOIN measurements AS m ON l.id = m.location_id
          WHERE m.id IS NULL
          AND l.deleted_at IS NULL
          AND l.account_id IN (:account_ids)
    }

    sql += " AND l.name ILIKE :query " if query.present?

    sql += " ), "

    sql += %{
      full_table AS (
        SELECT * FROM with_measurements
        UNION ALL
        SELECT y, name FROM with_no_measurements
      )
      SELECT * FROM full_table
    }

    sql += " ORDER BY 1 DESC, 2 ASC "
    sql += " LIMIT :limit" if limit.present?

    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to, limit: limit, query: query}])
  end

  def self.get_all_accounts_data_sql(from, to, account_ids, as_org_ids: nil, location_ids: nil, limit: nil, query: nil)
    sql = %{
      with with_measurements AS (
        SELECT
          COALESCE(SUM(m.download_total_bytes) + SUM(m.upload_total_bytes), 0) AS "y",
          a.name AS "name"
        FROM measurements AS m
          JOIN accounts AS a ON a.id = m.location_id
          LEFT OUTER JOIN autonomous_systems ON autonomous_systems.id = autonomous_system_id
          LEFT OUTER JOIN autonomous_system_orgs
          ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
        WHERE processed_at BETWEEN :from AND :to
        AND account_id IN (:account_ids)
    }

    sql += " AND autonomous_system_orgs.id IN (:as_org_ids)" if as_org_ids.present?
    sql += " AND a.name ILIKE :query " if query.present?
    sql += " GROUP BY a.name ), "

    sql += %{
       with_no_measurements AS (
          SELECT DISTINCT 0 AS "y", a.name AS "name", m.id
          FROM accounts AS a
            LEFT JOIN measurements AS m ON a.id = m.account_id
          WHERE m.id IS NULL
          AND a.id IN (:account_ids)
    }

    sql += " AND a.name ILIKE :query " if query.present?

    sql += " ), "

    sql += %{
      full_table AS (
        SELECT * FROM with_measurements
        UNION ALL
        SELECT y, name FROM with_no_measurements
      )
      SELECT * FROM full_table
    }

    sql += " ORDER BY 1 DESC, 2 ASC "
    sql += " LIMIT :limit" if limit.present?
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, as_org_ids: as_org_ids, location_ids: location_ids, from: from, to: to, limit: limit, query: query}])
  end

  def self.get_compare_total_data_sql(from, to, compare_by = 'account', curve_type = 'median', account_ids = nil, as_org_ids = nil, network_ids = nil, pod_ids = nil, category_names = nil)
    sql = self.get_comparison_total_data_sql(compare_by)
    ActiveRecord::Base.sanitize_sql([sql, {account_ids: account_ids, as_org_ids: as_org_ids, network_ids: network_ids, pod_ids: pod_ids, category_names: category_names, from: from, to: to}])
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

  def self.get_outages_sql(from, to, account_ids, location_ids = nil, outage_type = nil, as_org_id = nil)
    sql_args = {from: from, to: to, account_ids: account_ids}
    sql = %{
    SELECT
      network_outages.id,
      network_outages.autonomous_system_id,
      CASE
        WHEN network_outages.outage_type = 0 THEN 'unknown_reason'
        WHEN network_outages.outage_type = 1 THEN 'network_failure'
        WHEN network_outages.outage_type = 2 THEN 'isp_outage'
        ELSE 'power_outage' END as outage_type,
      network_outages.started_at,
      COALESCE(network_outages.resolved_at, NOW()) AS resolved_at,
      EXTRACT(EPOCH FROM COALESCE(network_outages.resolved_at, NOW()) - network_outages.started_at) * 1000 AS duration,
      COUNT(*) as count
    FROM network_outages
    JOIN locations ON locations.id = network_outages.location_id
    JOIN autonomous_systems ON autonomous_systems.id = network_outages.autonomous_system_id
    WHERE (network_outages.status = 2 OR network_outages.status = 0) AND locations.account_id IN (:account_ids)
    }

    if location_ids.present?
      sql += " AND network_outages.location_id = :location_ids "
      sql_args[:location_ids] = location_ids
    end

    if outage_type.present?
      sql += " AND network_outages.outage_type = :outage_type "
      sql_args[:outage_type] = outage_type
    end

    if as_org_id.present?
      sql += " AND autonomous_systems.autonomous_system_org_id = :as_org_id "
      sql_args[:as_org_id] = as_org_id
    end

    sql += %{
      AND network_outages.started_at < :to::timestamp
      AND (network_outages.resolved_at > :from::timestamp OR network_outages.resolved_at IS NULL)
      GROUP BY 1, 2, 3, 4, 5, 6
      ORDER BY network_outages.started_at ASC;
    }
    ActiveRecord::Base.sanitize_sql([sql, sql_args])
  end

  def self.get_outage_ids_sql(from, to, account_ids, page = 0, page_size = 10, location_id = nil, outage_type = nil, as_org_id = nil)
    sql_args = {from: from, to: to, account_ids: account_ids, page: page.to_i * 10, page_size: page_size.to_i}
    sql = %{
    SELECT
      network_outages.id
    FROM network_outages
    JOIN locations ON locations.id = network_outages.location_id
    JOIN autonomous_systems ON autonomous_systems.id = network_outages.autonomous_system_id
    WHERE (network_outages.status = 2 OR network_outages.status = 0) AND locations.account_id IN (:account_ids)
    }

    if location_id.present?
      sql += " AND network_outages.location_id = :location_id "
      sql_args[:location_id] = location_id
    end

    if outage_type.present?
      sql += " AND network_outages.outage_type = :outage_type "
      sql_args[:outage_type] = outage_type
    end

    if as_org_id.present?
      sql += " AND autonomous_systems.autonomous_system_org_id = :as_org_id "
      sql_args[:as_org_id] = as_org_id
    end

    sql += %{
      AND network_outages.started_at < :to::timestamp
      AND (network_outages.resolved_at > :from::timestamp OR network_outages.resolved_at IS NULL)
      ORDER BY network_outages.started_at DESC
      LIMIT :page_size OFFSET :page;
    }
    ActiveRecord::Base.sanitize_sql([sql, sql_args])
  end

  private
  def self.select_fields(compare_by)
    sql = ''
    case compare_by
    when 'account'
      sql += %{
        measurements.account_id,
        accounts.name as "account_name"
      }
    when 'network'
      sql += %{
        measurements.location_id,
        locations.name as "location_name"
      }
    when 'pod'
      sql += %{
        measurements.client_id,
        clients.unix_user as "client_unix_user"
      }
    when 'isp'
      sql += %{
        autonomous_system_org_id as "isp_id",
        autonomous_system_orgs.name as "isp_name"
      }
    when 'category'
      sql += %{
        categories.id as "category_id",
        categories.name as "category_name"
      }
    end
    sql
  end

  def self.join_fields(compare_by)
    sql = ''
    case compare_by
    when 'account'
      sql += ' JOIN accounts ON account_id = accounts.id '
    when 'network'
      sql += ' JOIN locations ON location_id = locations.id '
    when 'pod'
      sql += ' JOIN clients ON client_id = clients.id '
    when 'isp'
      sql += %{
        JOIN autonomous_systems ON autonomous_systems.id = measurements.autonomous_system_id
        JOIN autonomous_system_orgs ON autonomous_system_orgs.id = autonomous_systems.autonomous_system_org_id
      }
    when 'category'
      sql += %{
        JOIN categories ON categories.account_id = measurements.account_id
      }
    end
    sql
  end

  def self.inner_select_fields(compare_by)
    sql = ' SELECT '
    case compare_by
    when 'account'
      sql += 'account_name as entity_identifier,'
    when 'network'
      sql += 'location_name as entity_identifier,'
    when 'pod'
      sql += 'client_unix_user as entity_identifier,'
    when 'isp'
      sql += 'isp_name as entity_identifier,'
    when 'category'
      sql += 'category_name as entity_identifier,'
    end
    sql
  end

  def self.curve_type_fields(curve_type)
    sql = ''
    case curve_type
    when 'average'
      sql += ' AVG(value) as "y"'
    when 'min'
      sql += ' MIN(value) as "y"'
    when 'max'
      sql += ' MAX(value) as "y"'
    when 'median'
      sql += ' percentile_disc(0.5) WITHIN GROUP (ORDER BY value) as "y"'
    end
    sql
  end

  def self.where_fields(compare_by)
    sql = ' WHERE '
    case compare_by
    when 'account'
      sql += ' account_id IN (:account_ids) '
    when 'network'
      sql += ' location_id IN (:network_ids) '
    when 'pod'
      sql += ' client_id IN (:pod_ids) '
    when 'isp'
      sql += ' isp_id IN (:as_org_ids) '
    when 'category'
      sql += ' category_name LIKE ANY (array[:category_names]) '
    end
    sql
  end

  def self.get_comparison_speed_sql(compare_by, curve_type, key)
    %{
      WITH filtered_measurements AS (
        SELECT
          processed_at as "time",
          #{key} as "value",
          #{self.select_fields(compare_by)}
        FROM measurements
          #{self.join_fields(compare_by)}
        WHERE processed_at BETWEEN :from AND :to
        AND measurements.account_id IN (:account_ids)
        #{key.include?('SUM') ? 'GROUP BY 1,3,4' : ''}
      )

      #{self.inner_select_fields(compare_by)}
      EXTRACT(EPOCH FROM date_trunc('d', "time")) * 1000 as "x",
      #{self.curve_type_fields(curve_type)}
      FROM filtered_measurements
      #{self.where_fields(compare_by)}
      GROUP BY 1, 2
      ORDER BY "x" ASC;
      }
  end

  def self.get_comparison_total_data_sql(compare_by)
    %{
      WITH filtered_measurements AS (
        SELECT
          COALESCE(SUM(measurements.download_total_bytes) + SUM(measurements.upload_total_bytes), 0) as "value",
          #{self.select_fields(compare_by)}
        FROM measurements
          #{self.join_fields(compare_by)}
        WHERE processed_at BETWEEN :from AND :to
        AND measurements.account_id IN (:account_ids)
        GROUP BY 2,3
      )

      #{self.inner_select_fields(compare_by)} value as "y"
      FROM filtered_measurements
      #{self.where_fields(compare_by)}
      GROUP BY 1, 2
      ORDER BY 1 ASC;
      }
  end

  # I want to avoid having more than 500 dots
  # Base all calculations in seconds
  def self.get_interval_step(from, to)
    time_diff = to - from

    # I want to look for the best precision so that I'm getting around 500 dots
    units = %w[second minute day]
    best_unit = units
         .map { |unit| [unit, time_diff / 1.send(unit)]}
         .sort_by { |unit, dots| (DOT_LIMIT - dots).abs }
         .filter { |unit, dots| dots > DOT_MINIMUM }
         .first

    # Check if we have a best unit available. In cases where the time difference is too small, we might not have any
    # so we default the value to the smallest available unit
    if best_unit.nil?
      best_unit = units.first
    else
      best_unit = best_unit.first
    end

    dots_in_interval = time_diff / 1.send(best_unit)
    step = 1
    while dots_in_interval / step > DOT_LIMIT
      step += 5
    end
    return "#{step} ", best_unit
  end

  def self.get_base_series_sql(metric, as_org_ids, location_ids, pod_id = nil)
    sql = %{
    WITH
      base_series AS (
        SELECT date_trunc(:interval_unit, dd) as "time"
        FROM generate_series(:from::timestamp, :to::timestamp, CONCAT('1', :interval_unit)::interval) dd
      ),
      initial AS (
        SELECT
          time as x,
    }
    sql += " COALESCE(MAX(#{metric}_max), 0) as \"#9138E5\", "
    sql += " COALESCE(percentile_disc(0.5) WITHIN GROUP (ORDER BY #{metric}_median), 0) as \"#4B7BE5\", "
    sql += " COALESCE(MIN(#{metric}_min), 0) AS \"#FF695D\" "

    if pod_id.present?
      sql += " FROM aggregated_pod_measurements((SELECT time FROM base_series ORDER BY 1 LIMIT 1)::timestamp, :from::timestamp) "
      sql += " JOIN clients ON client_id = clients.id "
      sql += " WHERE aggregated_pod_measurements.account_id IN (:account_ids) "
    else
      sql += " FROM aggregated_measurements((SELECT time FROM base_series ORDER BY 1 LIMIT 1)::timestamp, :from::timestamp) "
      sql += " WHERE aggregated_measurements.account_id IN (:account_ids) "
    end

    sql += " AND autonomous_system_org_id IN (:as_org_ids)" if as_org_ids.present?
    sql += " AND location_id IN (:location_ids)" if location_ids.present?
    sql += " AND client_id = :pod_id" if pod_id.present?

    sql += %{
      GROUP BY time LIMIT 1
      ),
      full_series AS (
          SELECT * FROM initial
          UNION
          SELECT time as x, NULL, NULL, NULL FROM base_series
          UNION
          SELECT
            time as x,
    }
    sql += " MAX(#{metric}_max) as \"#9138E5\", "
    sql += " percentile_disc(0.5) WITHIN GROUP (ORDER BY #{metric}_median) as \"#4B7BE5\", "
    sql += " MIN(#{metric}_min) AS \"#FF695D\" "

    if pod_id.present?
      sql += " FROM aggregated_pod_measurements(:from::timestamp, :to::timestamp) "
      sql += " JOIN clients ON client_id = clients.id "
      sql += " WHERE aggregated_pod_measurements.account_id IN (:account_ids) "
    else
      sql += " FROM aggregated_measurements(:from::timestamp, :to::timestamp) "
      sql += " WHERE aggregated_measurements.account_id IN (:account_ids) "
    end


    sql += " AND autonomous_system_org_id IN (:as_org_ids)" if as_org_ids.present?
    sql += " AND location_id IN (:location_ids)" if location_ids.present?
    sql += " AND client_id = :pod_id" if pod_id.present?
    sql += %{
    GROUP BY 1 ORDER BY 1 ASC, 2 DESC
    ),
      completed_table AS (
          SELECT
            x,
            COALESCE("#9138E5", LAST_VALUE("#9138E5") OVER (PARTITION BY non_null_count ORDER BY x)) as "#9138E5",
            COALESCE("#4B7BE5", LAST_VALUE("#4B7BE5") OVER (PARTITION BY non_null_count ORDER BY x)) as "#4B7BE5",
            COALESCE("#FF695D", LAST_VALUE("#FF695D") OVER (PARTITION BY non_null_count ORDER BY x)) as "#FF695D"
          FROM (
            SELECT *, COUNT("#9138E5") OVER (ORDER BY x) as non_null_count FROM full_series ORDER BY 1 ASC, 2 DESC) t
          )
      SELECT
        EXTRACT(EPOCH FROM "x") * 1000 as x,
        COALESCE("#9138E5", 0) as "#9138E5",
        COALESCE("#4B7BE5", 0) as "#4B7BE5",
        COALESCE("#FF695D", 0) as "#FF695D"
        FROM completed_table GROUP BY 1,2,3,4 ORDER BY x;
      }
    sql
  end
end
