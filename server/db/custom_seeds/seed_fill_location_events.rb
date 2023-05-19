# This file is intended to run once and only once to
# populates the Event table with location created events
# To run, execute the following command:
# `rails runner db/custom_seeds/seed_fill_location_events.rb` inside the
# /server directory.

Location.all.each do |location|
  location.send_created_event
end