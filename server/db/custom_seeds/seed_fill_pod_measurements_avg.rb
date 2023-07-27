# This file is intended to sync the data_cap_current_period_usage of each existing Client.
# `rails runner db/custom_seeds/seed_fill_pod_measurements_avg.rb` inside the
# /server directory.

Client.all.each do |pod|
  pod.recalculate_averages!
end
