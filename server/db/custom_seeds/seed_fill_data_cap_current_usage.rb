# This file is intended to sync the data_cap_current_period_usage of each existing Client.
# `rails runner db/custom_seeds/seed_fill_data_cap_current_usage.rb` inside the
# /server directory.
current_month = Time.current.at_beginning_of_month
Client.transaction do
    Client.all.each do |c|
        c.data_cap_current_period_usage = 0.0
        c.data_cap_current_period = current_month
        measurements = c.measurements.where("created_at >= :date", {date: current_month})
        measurements.each do |measurement|
            c.data_cap_current_period_usage += measurement.download_total_bytes
            c.data_cap_current_period = measurement.created_at
        end
        c.save!
    end
end
