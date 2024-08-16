require "test_helper"

class LocationTest < ActiveSupport::TestCase
  test "when client and location are from different account expect failure" do
    location = locations(:different_account)
    client = clients(:pod1)
    client.location = location
    assert !client.save
  end

  test "when client and location are from same account expect success" do
    location = locations(:online1)
    client = clients(:pod1)
    client.location = location
    assert client.save
  end

  test "when client location changed, and offline, expect ip and autonomous_system to be cleared" do
    client = clients(:offline_with_autonomous_system_and_location)
    client.update!(location: nil)
    client.reload
    assert_nil client.ip
    assert_nil client.autonomous_system
  end

  test "when client location changed, and online, expect ip and autonomous_system to not be cleared" do
    client = clients(:online_with_autonomous_system_and_location)
    client.update!(location: nil)
    client.reload
    assert_not_nil client.ip
    assert_not_nil client.autonomous_system
  end
end
