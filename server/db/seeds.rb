# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

# Create, if not exists, the Default Group and add it to any client that has no group
UpdateGroup.where(:name => "Default Group").first_or_create do |group|
    Client.where(update_group: nil).each do |client|
        client.update_group = group
        client.save
    end
end

# Generate a token to all users that doesn't have one
User.all.each do |user|
    if user.token.nil?
        user.regenerate_token
    end
end

if Rails.env.production?
    # Update US locations with missing fips codes
    Location.where("county is NOT NULL AND latitude IS NOT NULL AND longitude IS NOT NULL AND county_fips IS NULL AND state_fips IS NULL").each do |loc|
        loc.state_fips, loc.county_fips = FipsGeocoderCli::get_fips_codes loc.latitude, loc.longitude
        loc.save
    end
end

if Rails.env.development?
  @users = User.all
  @user_accounts = UsersAccount.all
  if @users.count != @user_accounts.count
    @users.each do |user|
      @account = Account.new
      @account.account_type = 0
      @account.name = "#{user.first_name} #{user.last_name}"
      if @account.save
        @user_account = UsersAccount.new
        @user_account.user = user
        @user_account.account = @account
        @user_account.joined_at = user.created_at # Default account would have joined at the same time as user creation
        @user_account.save
      end
    end
  end
end