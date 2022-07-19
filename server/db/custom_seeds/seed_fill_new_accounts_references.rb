# Custom seed file for running once and populating
# initial locations/clients/measurements already
# in the database, linking them all with the corresponding
# default account.
# To run, execute the following command:
# `rails runner db/custom_seeds/seed_fill_new_accounts_references.rb` inside the
# /server directory.

puts 'Custom default accounts references seeder running...'

Location.all.each do |location|
  user_id = location.created_by_id
  if user_id.present?
    account_id_for_user = UsersAccount.find_by_user_id(user_id).account_id
    location.account_id = account_id_for_user
    location.save!
  end
end

Client.all.each do |client|
  user_id = client.claimed_by_id
  if user_id.present?
    account_id_for_user = UsersAccount.find_by_user_id(user_id).account_id
    client.account_id = account_id_for_user
    client.save!
  end
end

Measurement.all.each do |measurement|
  user_id = measurement.measured_by_id
  if user_id.present?
    account_id_for_user = UsersAccount.find_by_user_id(user_id).account_id
    measurement.account_id = account_id_for_user
    measurement.save!
  end
end