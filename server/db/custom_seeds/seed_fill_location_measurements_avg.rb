# This file is intended to sync the data_cap_current_period_usage of each existing Client.
# `rails runner db/custom_seeds/seed_fill_location_measurements_avg.rb` inside the
# /server directory.

Location.all.each do |location|
    location.download_avg = location.measurements.average(:download).round(3) if location.measurements.count.positive?
    
    location.upload_avg = location.measurements.average(:upload).round(3) if location.measurements.count.positive?
    location.save!
end
