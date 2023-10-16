# Run this only after our metrics_projections table has been populated.
sql = %{
  INSERT INTO autonomous_system_orgs_geospaces(autonomous_system_org_id, geospace_id) (
    SELECT DISTINCT metrics_projections.autonomous_system_org_id, geospaces.id
    FROM metrics_projections
    JOIN study_aggregates ON study_aggregates.id = study_aggregate_id
    JOIN geospaces ON geospaces.id = study_aggregates.geospace_id
    LEFT JOIN autonomous_system_orgs_geospaces ON autonomous_system_orgs_geospaces.autonomous_system_org_id = metrics_projections.autonomous_system_org_id AND autonomous_system_orgs_geospaces.geospace_id = geospaces.id
    WHERE metrics_projections.autonomous_system_org_id IS NOT NULL
    AND autonomous_system_orgs_geospaces.geospace_id IS NULL
    AND bucket_name = 'daily'
  )
}

ActiveRecord::Base.connection.execute(sql)
