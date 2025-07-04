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

if Rails.env.production?
    # Update US locations with missing fips codes
    Location.where("county is NOT NULL AND latitude IS NOT NULL AND longitude IS NOT NULL AND county_fips IS NULL AND state_fips IS NULL").each do |loc|
        loc.state_fips, loc.county_fips = FipsGeocoderCli::get_fips_codes loc.latitude, loc.longitude
        loc.save
    end
end

FEATURE_FLAGS = %w[networks charts]
FEATURE_FLAGS.each do |flag|
    FeatureFlag.find_or_create_by(name: flag) do |f|
        if Rails.env.development? || Rails.env.testing?
            f.generally_available = true
        end
    end
end

if Rails.env.development? && User.count == 0
  admin = User.create!(first_name: "admin", last_name: "admin", email: "admin@exactlylabs.com", password: "admin1234", super_user: true)
  acc = Account.create!(name: "Admin", superaccount: true)
  UsersAccount.create!(user: admin, account: acc, joined_at: Time.current)
end
