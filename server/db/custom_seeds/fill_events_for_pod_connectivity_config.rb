PodConnectivityConfig.all.each do |pc|
  next unless pc.events.blank?
  pc.send_created_event
end
