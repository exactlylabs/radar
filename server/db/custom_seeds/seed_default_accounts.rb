# This file is intended to run once and only once to
# do an initial population of outdated tables without
# the new Accounts tables and default data.
# To run, execute the following command:
# `rake db:seed:seed_default_accounts` inside the
# /server directory.

puts 'Custom default accounts seeder running...'

User.all.each do |user|
  @account = Account.new
  @account.account_type = 0 # Personal account from account_type enum
  @account.name = "#{user.first_name} #{user.last_name}"
  if @account.save!
    @user_account = UsersAccount.new
    @user_account.user = user
    @user_account.account = @account
    @user_account.joined_at = user.created_at # Default account would have joined at the same time as user creation
    @user_account.save!
  end
end