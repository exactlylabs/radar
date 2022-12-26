# This file is intended to run once and only once to
# do an initial population of outdated tables without
# the new Accounts tables and default data.
# To run, execute the following command:
# `rails runner db/custom_seeds/seed_set_default_group.rb` inside the
# /server directory.

puts "Setting Default Group's default flag to true..."

UpdateGroup.where(name: 'Default Group').first.update(default: true)