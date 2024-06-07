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
end
