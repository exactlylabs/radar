# Custom seed file for running once

# To run, execute the following command:
# `rails runner db/custom_seeds/seed_set_clients_in_use.rb` inside the
# /server directory.

# Set as in use all pods with measurements every day for the last 7 days
query = %{
WITH meas_by_day as (
    SELECT 
    measurements.client_id, 
    EXTRACT(DAY FROM measurements.created_at) as measurement_day
  FROM clients 
  JOIN measurements on measurements.client_id = clients.id 
  WHERE measurements.created_at > NOW() - INTERVAL '7 day'
  ), daily_count as (
    SELECT 
      client_id, 
      measurement_day,
      ROW_NUMBER() OVER (
        PARTITION BY client_id
      ) as rn
    FROM meas_by_day
    GROUP BY 1, 2
  )
  
  UPDATE clients SET in_service = true WHERE id IN (SELECT client_id FROM daily_count WHERE rn >= 1);
}
res = ActiveRecord::Base.connection.exec_query(query)

puts "Result is ", res
