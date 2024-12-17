require "test_helper"

class LocationTest < ActiveSupport::TestCase
  include Minitest
  setup do
    Geocoder::Lookup::Test.set_default_stub([{
      'coordinates'  => [40.7143528, -74.0059731],
      'address'      => 'Somewhere',
      'state'        => 'State',
      'state_code'   => 'ST',
      'country'      => 'United States',
      'country_code' => 'US',
      "county" => "County"
    }])
  end


  test "when location created with lonlat expect Reprocess Geospaces job to be called" do
    job = lambda { |location| assert location.lonlat.present? }
    ReprocessNetworkGeospaceJob.stub :perform_later, job do
      Location.create!(
        name: "Test", address: "Somewhere", lonlat: "POINT(1 1)",
        account: accounts(:root), created_by_id: users(:user1).id
      )
    end
  end

  test "when location updated with lonlat kept the same, expect job to not be called" do
    ReprocessNetworkGeospaceJob.stub :perform_later, proc { |l| raise "Should not be called" } do
      locations(:online1).update!(name: "NewName")
    end
  end

  test "when location updated with lonlat change, expect job to be called" do
    mock = Mock.new
    mock.expect(:call, nil, [locations(:online1)])
    ReprocessNetworkGeospaceJob.stub :perform_later, mock do
      locations(:online1).update!(lonlat: "POINT(40.5 1)")
    end
  end

  test "empty location not returned in where_pending_next_run" do
    assert_not Location.where_pending_next_run.include?(locations(:empty_location))
  end

  test "when compute bytes, and empty next run, expect run computed" do
    loc = locations(:empty_location)
    loc.compute_test!(100.0)

    assert_not_nil loc.scheduling_next_run
    assert_equal 0, loc.scheduling_current_count
    assert loc.scheduling_next_run >= loc.scheduling_current_period_start && loc.scheduling_next_run <= loc.scheduling_current_period_end
  end

  test "when compute bytes, and max count is 2, expect count to be 1" do
    loc = locations(:empty_location)
    loc.update(scheduling_max_count: 2, scheduling_current_period_start: Time.current, scheduling_current_period_end: Time.current + 1.hour)
    loc.compute_test!(100.0)

    assert_equal 1, loc.scheduling_current_count
    assert loc.scheduling_next_run >= loc.scheduling_current_period_start && loc.scheduling_next_run <= loc.scheduling_current_period_end
  end

  test "when compute bytes and max count exceeded, expect next period set" do
    loc = locations(:empty_location)
    period_start, period_end = Time.current.at_beginning_of_hour, Time.current.at_end_of_hour
    loc.update(scheduling_max_count: 1, scheduling_current_period_start: period_start, scheduling_current_period_end: period_end)
    loc.compute_test!(100.0)

    assert_equal 0, loc.scheduling_current_count
    assert_equal (period_start + 1.hour).at_beginning_of_hour, loc.scheduling_current_period_start
    assert_equal (period_start + 1.hour).at_end_of_hour, loc.scheduling_current_period_end
  end

  test "when next_scheduling_period with hourly periodicity, expect return" do
    loc = locations(:empty_location)
    loc.update(scheduling_periodicity: :hourly)
    t = Time.current.at_end_of_hour
    next_start, next_end = loc.next_scheduling_period(t)
    assert_equal (t + 1.hour).at_beginning_of_hour, next_start
    assert_equal (t + 1.hour).at_end_of_hour, next_end
  end

  test "when next_scheduling_period with daily periodicity, expect return" do
    loc = locations(:empty_location)
    loc.update(scheduling_periodicity: :daily)
    t = Time.current.at_end_of_day
    next_start, next_end = loc.next_scheduling_period(t)
    assert_equal t.next_day.at_beginning_of_day, next_start
    assert_equal t.next_day.at_end_of_day, next_end
  end

  test "when next_scheduling_period with weekly periodicity, expect return" do
    loc = locations(:empty_location)
    loc.update(scheduling_periodicity: :weekly)
    t = Time.current.at_end_of_day
    next_start, next_end = loc.next_scheduling_period(t)
    assert_equal t.next_week.at_beginning_of_week, next_start
    assert_equal t.next_week.at_end_of_week, next_end
  end

  test "when next_scheduling_period with monthly periodicity, expect return" do
    loc = locations(:empty_location)
    loc.update(scheduling_periodicity: :monthly)
    t = Time.current.at_end_of_month
    next_start, next_end = loc.next_scheduling_period(t)
    assert_equal t.next_month.at_beginning_of_month, next_start
    assert_equal t.next_month.at_end_of_month, next_end
  end

  test "when next_scheduling_period with timestamp too behind, expect it to move until reaching current time" do
    loc = locations(:empty_location)
    now = Time.current
    loc.update(scheduling_periodicity: :daily)

    next_start, next_end = loc.next_scheduling_period(now - 4.day)
    assert_equal now.at_beginning_of_day, next_start
    assert_equal now.at_end_of_day, next_end
  end

  test "when location with online client and run is due, expect pod test requested" do
    loc = locations(:empty_location)
    pod = clients(:pod1)
    pod.update(online: true, location: loc)

    assert Location.where_pending_next_run.include?(loc)

    Location.request_scheduled_tests!

    loc.reload
    pod.reload

    assert pod.test_requested?
  end

  test "when location with two online client and run is due, expect single pod test requested" do
    loc = locations(:empty_location)
    pod1 = clients(:pod1)
    pod2 = clients(:pod2)
    pod1.update(online: true, location: loc)
    pod2.update(online: true, location: loc)

    assert Location.where_pending_next_run.include?(loc)
    Location.request_scheduled_tests!

    loc.reload
    pod1.reload
    pod2.reload

    assert_equal 1, [pod1.test_requested, pod2.test_requested].count(true)
  end

  test "when location with one online client and other offline, and run is due, expect online pod test requested" do
    loc = locations(:empty_location)
    pod1 = clients(:pod1)
    pod2 = clients(:pod2)
    pod1.update(online: false, location: loc, test_requested: true)
    pod2.update(online: true, location: loc)

    assert Location.where_pending_next_run.include?(loc)
    Location.request_scheduled_tests!

    loc.reload
    pod1.reload
    pod2.reload

    assert_not pod1.test_requested?
    assert pod2.test_requested?
  end

  test "when location with selected pod pointing to different location, expect it gets removed" do
    loc = locations(:empty_location)
    pod1 = clients(:pod1)
    pod2 = clients(:pod2)
    pod1.update(online: true, location: nil)
    pod2.update(online: true, location: loc)

    assert Location.where_pending_next_run.include?(loc)
    Location.request_scheduled_tests!

    loc.reload
    pod1.reload
    pod2.reload

    assert_not pod1.test_requested?
    assert pod2.test_requested?
  end

  test "when data cap is set, and above max, expect pod not scheduled to run" do
    loc = locations(:empty_location)
    pod1 = clients(:pod1)
    pod1.update(online: true, location: loc)
    loc.update(data_cap_max_usage: 1000.0, data_cap_current_usage: 1001.0)

    Location.request_scheduled_tests!
    loc.reload
    pod1.reload

    assert_not pod1.test_requested?
  end

  test "when data cap is set, and below max, expect pod to be scheduled to run" do
    loc = locations(:empty_location)
    pod1 = clients(:pod1)
    pod1.update(online: true, location: loc)
    loc.update(data_cap_max_usage: 1000.0, data_cap_current_usage: 900.0)

    Location.request_scheduled_tests!
    loc.reload
    pod1.reload

    assert pod1.test_requested?
  end

  test "when data cap is above max, but period is due, expect it to be reset" do
    loc = locations(:empty_location)
    old_period = 1.month.ago
    loc.update(data_cap_max_usage: 1000.0, data_cap_current_usage: 900.0, data_cap_current_period: old_period, data_cap_periodicity: :monthly)

    Location.refresh_outdated_data_usage!
    loc.reload
    assert 0.0, loc.data_cap_current_usage
    assert (old_period + 1.month).at_end_of_month, loc.data_cap_current_period
  end

  test "when in scheduling restriction, expect not scheduled" do
    loc = locations(:empty_location)
    pod1 = clients(:pod1)
    pod1.update(online: true, location: loc)
    now = Time.current
    SchedulingRestriction.create(location: loc, time_start: (now - 1.hour).time, time_end: (now + 1.hour).time, weekdays: [now.wday])

    Location.request_scheduled_tests!
    loc.reload
    pod1.reload

    assert_not pod1.test_requested?
  end

  test "when has scheduling restriction, but not under it, expect scheduled" do
    loc = locations(:empty_location)
    pod1 = clients(:pod1)
    pod1.update(online: true, location: loc)
    now = Time.current
    SchedulingRestriction.create(location: loc, time_start: (now - 2.hour).time, time_end: (now - 1.hour).time, weekdays: [now.wday])
    Location.request_scheduled_tests!
    loc.reload
    pod1.reload

    assert pod1.test_requested?
  end

  test "when has scheduling restriction at the current time, but not current weekday, expect scheduled" do
    loc = locations(:empty_location)
    pod1 = clients(:pod1)
    pod1.update(online: true, location: loc)
    now = Time.current
    SchedulingRestriction.create(location: loc, time_start: (now - 2.hour).time, time_end: (now + 1.hour).time, weekdays: [now.tomorrow.wday])

    Location.request_scheduled_tests!
    loc.reload
    pod1.reload

    assert pod1.test_requested?
  end

end
