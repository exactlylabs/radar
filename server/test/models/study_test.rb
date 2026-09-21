require 'test_helper'

class StudyTest < ActiveSupport::TestCase
  test "fixtures link the rural study to its shapes on both sides" do
    rural = studies(:rural)

    assert_equal 90, rural.completion_days
    assert rural.notifications_enabled
    assert_equal [geospaces(:study_county), geospaces(:study_place), geospaces(:study_state)].map(&:id).sort, rural.geospaces.pluck(:id).sort
    assert_includes geospaces(:study_county).studies, rural
    assert_equal rural, study_aggregates(:study_county).study
  end

  test "fresno study has notifications off and a seven day threshold" do
    fresno = studies(:fresno)

    assert_equal 7, fresno.completion_days
    assert_not fresno.notifications_enabled
    assert fresno.level_census_tract
    assert fresno.level_zip
    assert_not fresno.level_census_place
  end

  test "name must be unique and completion_days positive" do
    assert_not Study.new(name: "rural", completion_days: 1).valid?
    assert_not Study.new(name: "new", completion_days: 0).valid?
    assert Study.new(name: "new", completion_days: 1).valid?
  end

  test "populate_aggregates! creates rows for every enabled level of the tagged shapes and is idempotent" do
    fresno = studies(:fresno)
    fresno.update!(level_zip: false)
    org = GeoTools::ASOrg.new("Fresno ISP", nil, nil, nil)

    GeoTools.stub :get_county_as_orgs, [org] do
      # state, state_with_study_only, county, isp_county, census_tract
      assert_difference 'StudyAggregate.count', 5 do
        fresno.populate_aggregates!
      end
      assert_no_difference 'StudyAggregate.count' do
        fresno.populate_aggregates!
      end
    end

    state = StudyAggregate.find_by!(study: fresno, level: 'state', geospace: geospaces(:fresno_state))
    county = StudyAggregate.find_by!(study: fresno, level: 'county', geospace: geospaces(:fresno_county))
    tract = StudyAggregate.find_by!(study: fresno, level: 'census_tract', geospace: geospaces(:fresno_tract))
    isp = StudyAggregate.find_by!(study: fresno, level: 'isp_county', geospace: geospaces(:fresno_county))

    assert_equal state, county.parent_aggregate
    assert_equal county, tract.parent_aggregate
    assert_equal state, isp.parent_aggregate
    assert_equal "Fresno ISP -> Fresno County", isp.name
    assert_equal AutonomousSystemOrg.find_by!(name: "Fresno ISP").id, isp.autonomous_system_org_id
    assert [state, county, tract, isp].all?(&:study_aggregate)
    assert StudyAggregate.where(study: fresno, geospace: geospaces(:fresno_other_county)).none?
  end
end
