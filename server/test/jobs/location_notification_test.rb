require 'test_helper'

class LocationNotificationTest < ActiveJob::TestCase
  setup do
    l1 = locations(:online1)
    l1.geospaces << [geospaces(:state1), geospaces(:county1)]
    l1.save!
    l2 = locations(:online2)
    l2.geospaces << [geospaces(:state1), geospaces(:county2)]
    l2.save!
    l3 = locations(:offline1)
    l3.geospaces << [geospaces(:state1), geospaces(:county2)]
    l3.save!
  end

  def location_info(location)
    LocationNotificationJobs::LocationNotificationJob.new().location_info(location)
  end

  test "location_info_content" do
    info = location_info(locations(:online1))
    assert_equal info.location, locations(:online1)
    assert_equal info.state, geospaces(:state1)
    assert_equal info.county, geospaces(:county1)
    assert_nil info.place
    assert_equal info.extra, {
      as_org: nil,
      locations_per_county_count: 1,
      locations_per_place_count: 0,
      locations_per_isp_county_count: nil,
      locations_per_isp_count: nil,
    }

  end

  test "location_info_only_online_count" do
    info = location_info(locations(:online2))
    assert_equal info.location, locations(:online2)
    assert_equal info.state, geospaces(:state1)
    assert_equal info.county, geospaces(:county2)
    assert_nil info.place
    assert_equal info.extra, {
      as_org: nil,
      locations_per_county_count: 1,
      locations_per_place_count: 0,
      locations_per_isp_county_count: nil,
      locations_per_isp_count: nil,
    }
  end

  test "location online notified" do
    mock = Minitest::Mock.new
    mock.expect(:call, nil) do |location_info|
      assert_equal location_info.location, locations(:online1)
    end

    EventsNotifier.stub :notify_location_online, mock do
     LocationNotificationJobs::NotifyLocationOnline.perform_now(locations(:online1), Time.now)
    end
    mock.verify
  end

  test "location online already notified" do
    l = locations(:online1)
    l.notified_when_online = true
    l.save!
    # Expect it to not be called
    EventsNotifier.stub :notify_location_online, -> (l_info){ raise "notify_location_online shouldn't be called" } do
     LocationNotificationJobs::NotifyLocationOnline.perform_now(locations(:online1), Time.now)
    end
  end
end
