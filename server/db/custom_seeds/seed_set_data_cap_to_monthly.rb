# Custom seed file for running once and populating
# initial locations/clients/measurements already
# in the database, linking them all with the corresponding
# default account.
# To run, execute the following command:
# `rails runner db/custom_seeds/seed_set_data_cap_to_monthly.rb` inside the
# /server directory.

puts 'Monthly data cap as default seeder running...'

Client.all.update_all(data_cap_periodicity: Client.data_cap_periodicities[:monthly])