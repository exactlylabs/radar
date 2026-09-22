require 'test_helper'

class StudyAggregateTest < ActiveSupport::TestCase
  test "find_or_create_for! creates a row keyed by study, level, shape and isp" do
    fresno = studies(:fresno)
    county = geospaces(:fresno_county)

    row = nil
    assert_difference 'StudyAggregate.count', 1 do
      row = StudyAggregate.find_or_create_for!(
        study: fresno, level: 'county', geospace_id: county.id, name: county.name, parent: nil, study_shape: true
      )
    end

    assert_equal fresno, row.study
    assert_equal 'county', row.level
    assert_equal county, row.geospace
    assert_equal "Fresno County", row.name
    assert row.study_aggregate
    assert_nil row.autonomous_system_org_id
  end

  test "find_or_create_for! updates the flag and parent of an existing row instead of creating a second one" do
    fresno = studies(:fresno)
    state = geospaces(:fresno_state)
    county = geospaces(:fresno_other_county)
    state_row = StudyAggregate.find_or_create_for!(study: fresno, level: 'state', geospace_id: state.id, name: state.name, parent: nil, study_shape: true)
    first = StudyAggregate.find_or_create_for!(study: fresno, level: 'county', geospace_id: county.id, name: county.name, parent: state_row, study_shape: false)

    assert_no_difference 'StudyAggregate.count' do
      StudyAggregate.find_or_create_for!(study: fresno, level: 'county', geospace_id: county.id, name: county.name, parent: state_row, study_shape: true)
    end

    assert first.reload.study_aggregate
    assert_equal state_row, first.parent_aggregate
  end

  test "isp rows are distinct per isp and named after the org" do
    fresno = studies(:fresno)
    county = geospaces(:fresno_county)
    org1 = autonomous_system_orgs(:as_org1)
    org2 = autonomous_system_orgs(:as_org2)

    assert_difference 'StudyAggregate.count', 2 do
      [org1, org2].each do |org|
        StudyAggregate.find_or_create_for!(
          study: fresno, level: 'isp_county', geospace_id: county.id,
          name: StudyAggregate.isp_county_name(org.name, county.name),
          parent: nil, study_shape: true, autonomous_system_org_id: org.id
        )
      end
    end

    row = StudyAggregate.find_by!(study: fresno, level: 'isp_county', geospace_id: county.id, autonomous_system_org_id: org1.id)
    assert_equal "Test Org 1 -> Fresno County", row.name
  end

  test "find_or_create_for! gives a shape its own row under each parent" do
    fresno = studies(:fresno)
    state = geospaces(:fresno_state)
    county1 = geospaces(:fresno_county)
    county2 = geospaces(:fresno_other_county)
    place = geospaces(:fresno_tract)

    state_row = StudyAggregate.find_or_create_for!(study: fresno, level: 'state', geospace_id: state.id, name: state.name, parent: nil, study_shape: true)
    county1_row = StudyAggregate.find_or_create_for!(study: fresno, level: 'county', geospace_id: county1.id, name: county1.name, parent: state_row, study_shape: true)
    county2_row = StudyAggregate.find_or_create_for!(study: fresno, level: 'county', geospace_id: county2.id, name: county2.name, parent: state_row, study_shape: true)
    under_county1 = StudyAggregate.find_or_create_for!(study: fresno, level: 'census_place', geospace_id: place.id, name: place.name, parent: county1_row, study_shape: true)

    under_county2 = nil
    assert_difference 'StudyAggregate.count', 1 do
      under_county2 = StudyAggregate.find_or_create_for!(study: fresno, level: 'census_place', geospace_id: place.id, name: place.name, parent: county2_row, study_shape: true)
    end
    assert_not_equal under_county1, under_county2
    assert_equal county1_row, under_county1.reload.parent_aggregate
    assert_equal county2_row, under_county2.parent_aggregate

    assert_no_difference 'StudyAggregate.count' do
      assert_equal under_county1, StudyAggregate.find_or_create_for!(study: fresno, level: 'census_place', geospace_id: place.id, name: place.name, parent: county1_row, study_shape: true)
    end
  end
end
