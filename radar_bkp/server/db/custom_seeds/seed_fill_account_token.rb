# This file is intended to run once and only once to
# do an initial population of outdated tables without
# the new Accounts tables and default data.
# To run, execute the following command:
# `rails runner db/custom_seeds/seed_fill_account_token.rb` inside the
# /server directory.

Account.all.each do |account|
  if account.token.nil?
    account.regenerate_token
  end
end