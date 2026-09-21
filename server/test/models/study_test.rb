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
end
