# Generate CREATED events for UpdateGroups
#
# rails runner db/custom_seeds/seed_fill_update_group_events.rb


UpdateGroup.all.each do |ug|
  if ug.events.size == 0
    ug.send_created_event
  end
end
