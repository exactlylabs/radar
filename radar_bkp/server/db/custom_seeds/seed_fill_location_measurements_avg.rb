# This file is intended to sync the data_cap_current_period_usage of each existing Client.
# `rails runner db/custom_seeds/seed_fill_location_measurements_avg.rb` inside the
# /server directory.

Location.all.each do |location|
    location.recalculate_averages!
end
