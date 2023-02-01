query = %{
  TRUNCATE consumer_offsets, client_count_aggregates, client_count_logs;
}
res = ActiveRecord::Base.connection.exec_query(query)