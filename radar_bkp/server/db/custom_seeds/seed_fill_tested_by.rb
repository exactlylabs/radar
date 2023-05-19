# Custom seed file for running once and populating
# initial tested_by reference to our own ExactlyLabs client
# in the database.
# To run, execute the following command:
# `rails runner db/custom_seeds/seed_fill_tested_by.rb` inside the
# /server directory.

puts 'Tested by column population seeder running....'

w = WidgetClient.create
w.client_name = 'ExactlyLabs'
w.client_urls = ['https://speedtest.exactlylabs.com', 'https://speed.exactlylabs.com', 'https://speed.radartoolkit.com']
w.save!

ClientSpeedTest.all.each do |speed_test|
  speed_test.widget_client = WidgetClient.find_by_client_name('ExactlyLabs')
  speed_test.save!
end