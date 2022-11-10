Client.update_outdated_online!

Client.left_outer_joins(:client_online_logs).where("client_online_logs.event_name IS NULL").each do |c|
  ClientOnlineLog.create!(
    client: c,
    account: c.account,
    event_name: c.online ? "WENT_ONLINE" : "WENT_OFFLINE"
  )
end
