require 'test_helper'

class StudyMetricsProjectionProcessorTest < ActiveSupport::TestCase
  setup do
    set_up_geocoder
    @as_org = autonomous_system_orgs(:as_org1)
    @processor = StudyMetricsProjectionProcessor::Processor.new
  end

  # Links a new location to the given shapes by hand. The processor reads a location's shapes
  # from geospaces_locations, so no geometry is needed. Creating a location geocodes its address
  # and overwrites lonlat, so the point is set afterwards without callbacks.
  def location_in(*shapes, point:)
    location = Location.create!(name: "Loc #{point}", address: "New Address", account: accounts(:root), created_by_id: 1)
    location.update_column(:lonlat, point)
    location.geospaces << shapes
    location
  end

  def projections
    @processor.instance_variable_get(:@consumer_offset).state["projections"]
  end

  def measure(location, longitude, latitude, processor: @processor)
    processor.handle_measurement(1, location.id, longitude, latitude, Time.now, @as_org.id, @as_org.name)
  end

  test "point in a rural study county builds the rural tree and reuses existing rows" do
    location = location_in(geospaces(:study_state), geospaces(:study_county), geospaces(:study_place), point: "POINT(1 1)")

    measure(location, 1.0, 1.0)

    rural = studies(:rural)
    shapes = [geospaces(:study_state), geospaces(:study_county), geospaces(:study_place)]
    levels = StudyAggregate.where(study: rural, geospace: shapes).pluck(:level).sort
    assert_equal %w[census_place county isp_county state state_with_study_only], levels
    assert_equal 1, StudyAggregate.where(study: rural, level: 'county', geospace: geospaces(:study_county)).count
    assert StudyAggregate.where(study: rural, level: %w[census_tract zip]).none?

    county = study_aggregates(:study_county)
    assert_equal 1, @processor.get_projection(county.id, county.parent_aggregate_id, @as_org.id)["measurements_count"]
    state_only = StudyAggregate.find_by!(study: rural, level: 'state_with_study_only', geospace: geospaces(:study_state))
    assert_equal 1, projections["#{state_only.id}-#{@as_org.id}"]["measurements_count"]
  end

  test "point in a fresno tract builds tract under county and zip under state, no place" do
    location = location_in(
      geospaces(:fresno_state), geospaces(:fresno_county), geospaces(:fresno_tract), geospaces(:fresno_zip), point: "POINT(2 2)"
    )

    measure(location, 2.0, 2.0)

    fresno = studies(:fresno)
    state = StudyAggregate.find_by!(study: fresno, level: 'state', geospace: geospaces(:fresno_state))
    county = StudyAggregate.find_by!(study: fresno, level: 'county', geospace: geospaces(:fresno_county))
    tract = StudyAggregate.find_by!(study: fresno, level: 'census_tract', geospace: geospaces(:fresno_tract))
    zip = StudyAggregate.find_by!(study: fresno, level: 'zip', geospace: geospaces(:fresno_zip))
    isp = StudyAggregate.find_by!(study: fresno, level: 'isp_county', geospace: geospaces(:fresno_county), autonomous_system_org_id: @as_org.id)

    assert_equal county, tract.parent_aggregate
    assert_equal state, zip.parent_aggregate
    assert_equal state, isp.parent_aggregate
    assert [state, county, tract, zip, isp].all?(&:study_aggregate)
    assert StudyAggregate.where(study: fresno, level: 'census_place').none?
    assert_equal 1, @processor.get_projection(tract.id, county.id, @as_org.id)["measurements_count"]
    assert_equal 1, @processor.get_projection(zip.id, state.id, @as_org.id)["measurements_count"]
  end

  test "point in a non-study county of a study state builds an other row and skips the study-only state" do
    location = location_in(geospaces(:fresno_state), geospaces(:fresno_other_county), point: "POINT(3 3)")

    measure(location, 3.0, 3.0)

    fresno = studies(:fresno)
    county = StudyAggregate.find_by!(study: fresno, level: 'county', geospace: geospaces(:fresno_other_county))
    assert_not county.study_aggregate
    assert_equal 1, projections["#{county.id}-#{@as_org.id}"]["measurements_count"]

    state_only = StudyAggregate.find_by!(study: fresno, level: 'state_with_study_only', geospace: geospaces(:fresno_state))
    assert_nil projections["#{state_only.id}-#{@as_org.id}"]
  end

  test "point outside every study builds nothing" do
    location = location_in(geospaces(:state2), geospaces(:county2), point: "POINT(4 4)")

    assert_no_difference 'StudyAggregate.count' do
      measure(location, 4.0, 4.0)
    end
    assert_empty projections
  end

  test "tagging a shape into a study updates the existing aggregate instead of creating a second one" do
    location = location_in(geospaces(:fresno_state), geospaces(:fresno_other_county), point: "POINT(5 5)")
    measure(location, 5.0, 5.0)
    county = StudyAggregate.find_by!(study: studies(:fresno), level: 'county', geospace: geospaces(:fresno_other_county))
    assert_not county.study_aggregate

    studies(:fresno).geospaces << geospaces(:fresno_other_county)
    fresh_processor = StudyMetricsProjectionProcessor::Processor.new

    assert_no_difference 'StudyAggregate.count' do
      measure(location, 5.0, 5.0, processor: fresh_processor)
    end
    assert county.reload.study_aggregate
  end

  test "point in two studies counts each study's state-only row against its own study county" do
    # Tag the same shapes into rural too, so this point now belongs to both fresno and rural.
    studies(:rural).geospaces << [geospaces(:fresno_state), geospaces(:fresno_other_county)]
    fresh_processor = StudyMetricsProjectionProcessor::Processor.new

    location = location_in(geospaces(:fresno_state), geospaces(:fresno_other_county), point: "POINT(6 6)")
    measure(location, 6.0, 6.0, processor: fresh_processor)

    rural = studies(:rural)
    fresno = studies(:fresno)

    rural_county = StudyAggregate.find_by!(study: rural, level: 'county', geospace: geospaces(:fresno_other_county))
    fresno_county = StudyAggregate.find_by!(study: fresno, level: 'county', geospace: geospaces(:fresno_other_county))
    assert rural_county.study_aggregate
    assert_not fresno_county.study_aggregate
    assert_equal 2, StudyAggregate.where(level: 'county', geospace: geospaces(:fresno_other_county)).count

    rural_state_only = StudyAggregate.find_by!(study: rural, level: 'state_with_study_only', geospace: geospaces(:fresno_state))
    fresno_state_only = StudyAggregate.find_by!(study: fresno, level: 'state_with_study_only', geospace: geospaces(:fresno_state))

    fresh_projections = fresh_processor.instance_variable_get(:@consumer_offset).state["projections"]
    assert_equal 1, fresh_projections["#{rural_state_only.id}-#{@as_org.id}"]["measurements_count"]
    assert_nil fresh_projections["#{fresno_state_only.id}-#{@as_org.id}"]
  end

  def online_for_days(location, days)
    meta = @processor.get_location_metadata(location.id)
    meta.online = true
    meta.days_online = days
    meta.autonomous_system_org_id = @as_org.id
    meta
  end

  test "daily tick completes a fresno location at 7 days and a rural one at 90" do
    fresno_loc = location_in(geospaces(:fresno_state), geospaces(:fresno_county), geospaces(:fresno_tract), point: "POINT(6 6)")
    rural_at_7 = location_in(geospaces(:study_state), geospaces(:study_county), point: "POINT(7 7)")
    rural_at_90 = location_in(geospaces(:study_state), geospaces(:study_county), point: "POINT(8 8)")
    online_for_days(fresno_loc, 6)
    online_for_days(rural_at_7, 6)
    online_for_days(rural_at_90, 89)

    @processor.handle_daily_trigger(Date.today)

    fresno_county = StudyAggregate.find_by!(study: studies(:fresno), level: 'county', geospace: geospaces(:fresno_county))
    fresno_tract = StudyAggregate.find_by!(study: studies(:fresno), level: 'census_tract', geospace: geospaces(:fresno_tract))
    rural_county = study_aggregates(:study_county)

    assert_equal 1, @processor.get_projection(fresno_county.id, fresno_county.parent_aggregate_id, @as_org.id)["completed_locations_count"]
    assert_equal 1, @processor.get_projection(fresno_tract.id, fresno_tract.parent_aggregate_id, @as_org.id)["completed_locations_count"]
    assert_equal 1, @processor.get_projection(rural_county.id, rural_county.parent_aggregate_id, @as_org.id)["completed_locations_count"]
    assert_equal 7, @processor.get_location_metadata(fresno_loc.id).days_online
    assert_equal 7, @processor.get_location_metadata(rural_at_7.id).days_online
    assert_equal 90, @processor.get_location_metadata(rural_at_90.id).days_online
  end

  test "daily tick does not complete a location whose day count is not a threshold" do
    location = location_in(geospaces(:study_state), geospaces(:study_county), point: "POINT(9 9)")
    online_for_days(location, 40)

    @processor.handle_daily_trigger(Date.today)

    assert_equal 41, @processor.get_location_metadata(location.id).days_online
    assert_empty projections
  end

  test "going offline before completion lowers completed_and_online, after completion it does not" do
    location = location_in(geospaces(:fresno_state), geospaces(:fresno_county), point: "POINT(10 10)")
    client_as = autonomous_systems(:as_1)
    meta = online_for_days(location, 0)
    meta.online = false
    meta.online_pods_count = 0

    @processor.update_online_count_for_location(Time.now, location.id, client_as.id, 1)
    county = StudyAggregate.find_by!(study: studies(:fresno), level: 'county', geospace: geospaces(:fresno_county))
    proj = @processor.get_projection(county.id, county.parent_aggregate_id, @as_org.id)
    assert_equal 1, proj["online_locations_count"]
    assert_equal 1, proj["completed_and_online_locations_count"]

    @processor.update_online_count_for_location(Time.now, location.id, client_as.id, -1)
    assert_equal 0, proj["online_locations_count"]
    assert_equal 0, proj["completed_and_online_locations_count"]

    # Once completed, the location was already counted in completed_and_online by the daily tick,
    # so coming online again must not count it a second time.
    meta.days_online = 7
    @processor.update_online_count_for_location(Time.now, location.id, client_as.id, 1)
    assert_equal 1, proj["online_locations_count"]
    assert_equal 0, proj["completed_and_online_locations_count"]

    @processor.update_online_count_for_location(Time.now, location.id, client_as.id, -1)
    assert_equal 0, proj["online_locations_count"]
    assert_equal 0, proj["completed_and_online_locations_count"]
  end
end
