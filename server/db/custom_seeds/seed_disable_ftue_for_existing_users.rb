# This file is intended to run once and only once to
# do an initial population of outdated tables without
# the new Accounts tables and default data.
# To run, execute the following command:
# `rails runner db/custom_seeds/seed_disable_ftue_for_existing_users.rb` inside the
# /server directory.

puts 'Custom default user FTUE seed running...'

User.update_all(ftue_disabled: true)