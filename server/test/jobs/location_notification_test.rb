require 'test_helper'

class LocationNotificationTest < ActiveJob::TestCase
  self.use_transactional_tests = true

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

  test "When_location_info_gets_a_location_where_county_has_offline_pod_Expect_that_pod_to_not_be_accounted" do
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

  test "When_location_info_gets_a_location_and_county_has_more_online_locations_Expect_all_online_locations_to_be_accounted_for" do
    l = locations(:offline1)
    l.online = true
    l.save!

    info = location_info(locations(:online2))

    assert_equal info.location, locations(:online2)
    assert_equal info.state, geospaces(:state1)
    assert_equal info.county, geospaces(:county2)
    assert_nil info.place
    assert_equal info.extra, {
      as_org: nil,
      locations_per_county_count: 2,
      locations_per_place_count: 0,
      locations_per_isp_county_count: nil,
      locations_per_isp_count: nil,
    }
  end

  test "When_notify_location_online_job_is_called_and_location_was_never_notified_Expect_job_to_notify_about_it" do
    mock = Minitest::Mock.new
    mock.expect(:call, nil) do |location_info|
      assert_equal location_info.location, locations(:online1)
    end

    EventsNotifier.stub :notify_location_online, mock do
     LocationNotificationJobs::NotifyLocationOnline.perform_now(locations(:online1), Time.now)
    end

    mock.verify
  end

  test "When_notify_location_online_job_is_called_and_location_was_already_notified_Expect_job_to_do_nothing" do
    l = locations(:online1)
    l.notified_when_online = true
    l.save!

    # Expect it to not be called
    EventsNotifier.stub :notify_location_online, -> (l_info){ raise "notify_location_online shouldn't be called" } do
     LocationNotificationJobs::NotifyLocationOnline.perform_now(locations(:online1), Time.now)
    end

  end

  test "When_notify_location_online_job_is_called_and_county_goal_reached_Expect_job_to_notify_about_it" do
    locations = []
    (1..Location::LOCATIONS_PER_COUNTY_GOAL).each do |i|
      l = Location.create!(
        name: "Loc #{i}", address: "Loc #{i}", account: accounts(:root), created_by_id: 1, lonlat: "POINT(#{i} #{i})",
        online: true
      )
      l.geospaces << [geospaces(:study_state), geospaces(:study_county), geospaces(:study_place)]
      l.save!
      locations << l
    end

    mock = Minitest::Mock.new
    mock.expect :call, :nil, [geospaces(:study_county), Location::LOCATIONS_PER_COUNTY_GOAL]
    mock.expect :call, :nil, [geospaces(:study_place), Location::LOCATIONS_PER_PLACE_GOAL]

    EventsNotifier.stub :notify_study_goal_reached, mock do
     LocationNotificationJobs::NotifyLocationOnline.perform_now(locations[-1], Time.now)
    end

    mock.verify
  end

  test "When_notify_location_job_is_called_and_study_aggregates_with_custom_goal_reached_Expect_job_to_notify_about_it" do
    locations = []
    study_aggregates(:study_county).update(locations_goal: 4)
    study_aggregates(:study_place).update(locations_goal: 1)
    (1..4).each do |i|
      l = Location.create!(
        name: "Loc #{i}", address: "Loc #{i}", account: accounts(:root), created_by_id: 1, lonlat: "POINT(#{i} #{i})",
        online: true
      )
      l.geospaces << [geospaces(:study_state), geospaces(:study_county), geospaces(:study_place)]
      l.save!
      locations << l
    end
    mock = Minitest::Mock.new
    mock.expect :call, :nil, [geospaces(:study_county), 4]
    mock.expect :call, :nil, [geospaces(:study_place), 1]

    EventsNotifier.stub :notify_study_goal_reached, mock do
     LocationNotificationJobs::NotifyLocationOnline.perform_now(locations[-1], Time.now)
    end

    mock.verify

  end

  test "When_notify_location_job_is_called_and_study_aggregates_with_custom_goal_not_reached_Expect_job_to_not_notify_about_it" do
    locations = []
    study_aggregates(:study_county).update(locations_goal: 4)
    study_aggregates(:study_place).update(locations_goal: 1)
    (1..2).each do |i|
      l = Location.create!(
        name: "Loc #{i}", address: "Loc #{i}", account: accounts(:root), created_by_id: 1, lonlat: "POINT(#{i} #{i})",
        online: true
      )
      l.geospaces << [geospaces(:study_state), geospaces(:study_county), geospaces(:study_place)]
      l.save!
      locations << l
    end

    mock = Minitest::Mock.new
    mock.expect :call, :nil, [geospaces(:study_place), 1]

    EventsNotifier.stub :notify_study_goal_reached, mock do
     LocationNotificationJobs::NotifyLocationOnline.perform_now(locations[-1], Time.now)
    end

    mock.verify

  end
end
