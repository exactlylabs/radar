require 'test_helper'
class MobileSpeedTestsTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  setup do
    Geocoder::Lookup::Test.set_default_stub([])
    Rails.cache.clear
  end

  test "when speed test details requested, expect response" do
    m_user = mobile_user_device("test@test.com")
    s = ClientSpeedTest.create!(download_avg: 100.0, upload_avg: 33.0, latitude: 20.0, longitude: -120, tested_by: 1)

    mobile_get(m_user, "/mobile_api/v1/speed_tests/#{s.id}")

    assert_response :success
  end

  test "when new speed test posted, expect job scheduled" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    tested_at = Time.now

    File.open(Rails.root.join("test", "fixtures", "files", "result_with_lastServerMeasurement_on_download_and_upload.json")) do |f|
      data = {
        tested_at: tested_at,
        longitude: -120,
        latitude: 30,
        result: f
      }

      assert_enqueued_jobs 1, only: ProcessSpeedTestJob do
        mobile_post(m_user, "/mobile_api/v1/speed_tests", params: data)
      end
    end

    assert_response :created
    t = ClientSpeedTest.find(@response.parsed_body["id"])
    assert t.result.attached?
    assert_equal m_user.user, t.user
  end

  test "when isps action is called, return a list of all isps with tests" do
    m_user = mobile_user_device("test@test.com")
    ClientSpeedTest.create!(
      download_avg: 100.0, upload_avg: 33.0, lonlat: 'POINT(-120 46)', tested_by: 1,
      autonomous_system: autonomous_systems(:as_1)
    )
    ClientSpeedTest.create!(
      download_avg: 100.0, upload_avg: 33.0, lonlat: 'POINT(-122 46)', tested_by: 1,
      autonomous_system: autonomous_systems(:as_2)
    )

    mobile_get(m_user, "/mobile_api/v1/speed_tests/isps")

    assert_response :success

    assert_equal(
      {"items" => [
        {"id" => autonomous_system_orgs(:as_org1).id, "name" => autonomous_system_orgs(:as_org1).name},
        {"id" => autonomous_system_orgs(:as_org2).id, "name" => autonomous_system_orgs(:as_org2).name}
      ]},
      @response.parsed_body
    )
  end

  test "when isps action called with bounding box, expect filter applied" do
    m_user = mobile_user_device("test@test.com")
    ClientSpeedTest.create!(
      download_avg: 100.0, upload_avg: 33.0, lonlat: 'POINT(-120 46)', tested_by: 1,
      autonomous_system: autonomous_systems(:as_1)
    )
    ClientSpeedTest.create!(
      download_avg: 100.0, upload_avg: 33.0, lonlat: 'POINT(-122 46)', tested_by: 1,
      autonomous_system: autonomous_systems(:as_2)
    )

    mobile_get(m_user, "/mobile_api/v1/speed_tests/isps", params: {'bbox' => [-120, 60, 120, -60]})

    assert_response :success
    assert_equal(
      {"items" => [
        {"id" => autonomous_system_orgs(:as_org1).id, "name" => autonomous_system_orgs(:as_org1).name}
      ]},
      @response.parsed_body
    )

  end

  test "when vector tile called, expect response" do
    m_user = mobile_user_device("test@test.com")
    ClientSpeedTest.create!(
      download_avg: 100.0, upload_avg: 33.0, lonlat: 'POINT(-120 46)', tested_by: 1,
      autonomous_system: autonomous_systems(:as_1)
    )
    ClientSpeedTest.create!(
      download_avg: 100.0, upload_avg: 33.0, lonlat: 'POINT(-122 46)', tested_by: 1,
      autonomous_system: autonomous_systems(:as_2)
    )

    mobile_get(m_user, "/mobile_api/v1/speed_tests/tiles/0/0/0")

    assert_response :success
    assert_equal 'application/vnd.mapbox-vector-tile', response.content_type
    assert_not_nil response.body
  end

  test "when vector tile called, expect cache set" do
    m_user = mobile_user_device("test@test.com")
    ClientSpeedTest.create!(
      download_avg: 100.0, upload_avg: 33.0, lonlat: 'POINT(-120 46)', tested_by: 1,
      autonomous_system: autonomous_systems(:as_1)
    )
    ClientSpeedTest.create!(
      download_avg: 100.0, upload_avg: 33.0, lonlat: 'POINT(-122 46)', tested_by: 1,
      autonomous_system: autonomous_systems(:as_2)
    )

    mobile_get(m_user, "/mobile_api/v1/speed_tests/tiles/0/0/0")

    keys = Rails.cache.delete_matched("/mvt/speed_tests/0/0/0/*")
    assert_equal 1, keys.length
  end
end
