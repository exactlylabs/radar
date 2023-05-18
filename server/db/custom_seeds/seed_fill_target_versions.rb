
ug = UpdateGroup.arel_table

UpdateGroup.all.each do |update_group|
  sql = %{
    UPDATE clients 
      SET target_client_version_id = :client_version_id
    WHERE clients.id IN (:client_ids)
  }  
  ActiveRecord::Base.connection.execute(
    ApplicationRecord.sanitize_sql(
      [sql, {client_ids: update_group.clients.pluck(:id), client_version_id: update_group.client_version_id}]
    )
  )

  sql = %{
    UPDATE clients
      SET 
        has_watchdog = true, 
        target_watchdog_version_id = :watchdog_version_id
    WHERE clients.id IN (:client_ids)
    AND (clients.raw_watchdog_version IS NOT NULL AND clients.raw_watchdog_version != '')
  }
  ActiveRecord::Base.connection.execute(
    ApplicationRecord.sanitize_sql(
      [sql, {client_ids: update_group.clients.pluck(:id), watchdog_version_id: update_group.watchdog_version_id}]
    )
  )
end


