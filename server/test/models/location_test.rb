require "test_helper"

class LocationTest < ActiveSupport::TestCase
  test "online_scope" do
    assert_equal Location.where_online.all().to_a, [locations(:online1), locations(:online2)]
  end

  test "offline_scope" do
    assert_equal Location.where_offline.all().to_a, [locations(:offline1)]
  end
end
