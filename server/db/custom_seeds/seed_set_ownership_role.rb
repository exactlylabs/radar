# This file is intended to run once and only once to
# do an initial population of outdated tables without
# the new Accounts tables and default data.
# To run, execute the following command:
# `rails runner db/custom_seeds/see_set_ownsership_rol.rb` inside the
# /server directory.

puts "Setting Owner role to first users for each account..."

Account.all.each do |account|
  all_user_accounts_for_account = account.users_accounts
  all_user_accounts_for_account.each do |user_account|
    # Although the DB has a default value of guest, this makes sense
    # once we start adding new members into accounts. For all existing
    # user accounts, we want them to have full access to actions (aka owner & collab)
    user_account.update(role: UsersAccount.roles[:collaborator]) 
  end
  # Set the first user account to be the owner (expecting this user 
  # to be the one who created the account).
  first_user_account = all_user_accounts_for_account.order("created_at ASC").first
  first_user_account.update(role: UsersAccount.roles[:owner]) if first_user_account
end