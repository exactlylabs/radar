# This file is intended to run once and only once to
# do an initial population of the ClientEventLog table for existing Clients
# To run, execute the following command:
# `rails runner db/custom_seeds/seed_fill_client_logs.rb` inside the
# /server directory.

Client.all.each do |client|
    client.send_created_event
end