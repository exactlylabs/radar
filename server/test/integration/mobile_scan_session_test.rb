require 'test_helper'

class MobileScanSessionTest < ActionDispatch::IntegrationTest
  include ActiveJob::TestHelper

  def serialize_scan_session(scan_session, details: false)
    s = {
      "id" => scan_session.id,
      "created_at" => serialize_datetime(scan_session.created_at),
      "updated_at" => serialize_datetime(scan_session.updated_at),
    }
    if details
      s = s.merge({
        "wifi_count" => scan_session.wifi_networks.count,
        "cell_count" => scan_session.cell_networks.count,
        "speed_test_count" => scan_session.speed_tests.count,
      })
    end

    return s
  end

  def serialize_scan_network(scan_network, session_network)
    {
      "id" => scan_network.id,
      "network_type" => scan_network.network_type,
      "name" => scan_network.name,
      "last_seen_at" => session_network.last_seen_at,
      "is_new" => session_network.is_new
    }
  end

  test "when register new session, expect it is created" do
    m_user = mobile_user_device("test@test.com")
    mobile_post(m_user, "/mobile_api/v1/scan_sessions", params: {})

    scan_session = MobileScanSession.where(mobile_user_device: m_user).last

    assert_response :created
    assert scan_session.present?
    assert_equal(
      serialize_scan_session(scan_session, details: true),
      @response.parsed_body
    )
  end

  test "when register new session called without token, expect 401" do
    post "/mobile_api/v1/scan_sessions", params: {}

    assert_response :unauthorized
  end

  test "when new result posted, expect response 204" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    pkg = ScanPackagePb::ScanPackage.encode(ScanPackagePb::ScanPackage.new(
      cells: [
        ScanPackagePb::Cell.new(id: "Cell1"),
        ScanPackagePb::Cell.new(id: "Cell2"),
      ]
    ))
    headers = {"Content-Type" => "application/protobuf"}
    mobile_post(m_user, "/mobile_api/v1/scan_sessions/#{scan.id}/posts", headers: headers, params: pkg)

    assert_response :no_content
  end

  test "when post for different user device, expect not found" do
    m_user = mobile_user_device("test@test.com")
    m_user2 = mobile_user_device("test2@test.com")
    scan = scan_session(m_user)
    pkg = ScanPackagePb::ScanPackage.encode(ScanPackagePb::ScanPackage.new(
      cells: [
        ScanPackagePb::Cell.new(id: "Cell1"),
        ScanPackagePb::Cell.new(id: "Cell2"),
      ]
    ))

    headers = {"Content-Type" => "application/protobuf"}
    mobile_post(m_user2, "/mobile_api/v1/scan_sessions/#{scan.id}/posts", headers: headers, params: pkg)

    assert_response :not_found
  end

  test "when post content, expect measurements registered" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    # 2 Cell signals found -- 1 measurement each
    # 1 Access Point found -- 1 measurement
    pkg = ScanPackagePb::ScanPackage.encode(ScanPackagePb::ScanPackage.new(
      access_points: [
        ScanPackagePb::AccessPoint.new(id: "AP1", bssid: "AP1", ssid: "TestNet", capabilities: "[WPA2-PSK]"),
      ],
      cells: [
        ScanPackagePb::Cell.new(id: "Cell1", phone_type: 1, data_network_type: 2),
        ScanPackagePb::Cell.new(id: "Cell2", phone_type: 1, data_network_type: 3),
      ],
      measurements: [
        ScanPackagePb::SignalMeasurement.new(
          signal_id: ScanPackagePb::SignalId.new(id: "Cell1", signal_type: ScanPackagePb::SignalType::CELL),
          latitude_before: 47.6104725, longitude_before: -122.3385839, accuracy_before: 11.255000114440918,
          latitude_after: 47.6102831, longitude_after: -122.3403981, accuracy_after: 11.472999572753906,
          timestamp_before: Time.parse("2024-10-01T10:00:00Z"), timestamp_after: Time.parse("2024-10-01T10:00:01Z"),
          dbm: -34,
        ),
        ScanPackagePb::SignalMeasurement.new(
          signal_id: ScanPackagePb::SignalId.new(id: "AP1", signal_type: ScanPackagePb::SignalType::WIFI),
          latitude_before: 47.6123896, longitude_before: -122.282069, accuracy_before: 10.699000358581543,
          latitude_after: 47.611294, longitude_after: -122.2827178, accuracy_after: 11.600000381469727,
          timestamp_before: Time.parse("2024-10-01T09:59:00Z"), timestamp_after: Time.parse("2024-10-01T09:59:10Z"),
          dbm: -80, snr: 2147483647
        ),
        ScanPackagePb::SignalMeasurement.new(
          signal_id: ScanPackagePb::SignalId.new(id: "Cell2", signal_type: ScanPackagePb::SignalType::CELL),
          latitude_before: 47.6123896, longitude_before: -122.282069, accuracy_before: 10.699000358581543,
          latitude_after: 47.611294, longitude_after: -122.2827178, accuracy_after: 11.600000381469727,
          timestamp_before: Time.parse("2024-10-01T10:00:00Z"), timestamp_after: Time.parse("2024-10-01T10:00:01Z"),
          dbm: -55, snr: 1000
        ),
      ]
    ))
    headers = {"Content-Type" => "application/protobuf"}
    mobile_post(m_user, "/mobile_api/v1/scan_sessions/#{scan.id}/posts", headers: headers, params: pkg)

    assert_equal 3, scan.mobile_scan_network_measurements.count
  end

  test "when post with one cache hit, expect measurement not saved" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    # 2 Cell signals found -- 1 measurement each
    pkg = ScanPackagePb::ScanPackage.encode(ScanPackagePb::ScanPackage.new(
      access_points: [],
      cells: [
        ScanPackagePb::Cell.new(id: "Cell1", phone_type: 1, data_network_type: 2),
        ScanPackagePb::Cell.new(id: "Cell2", phone_type: 1, data_network_type: 3),
      ],
      measurements: [
        ScanPackagePb::SignalMeasurement.new(
          signal_id: ScanPackagePb::SignalId.new(id: "Cell1", signal_type: ScanPackagePb::SignalType::CELL),
          latitude_before: 47.6104725, longitude_before: -122.3385839, accuracy_before: 11.255000114440918,
          latitude_after: 47.6102831, longitude_after: -122.3403981, accuracy_after: 11.472999572753906,
          timestamp_before: Time.parse("2024-10-01T10:00:00Z"), timestamp_after: Time.parse("2024-10-01T10:00:01Z"),
          dbm: -34,
        ),
        ScanPackagePb::SignalMeasurement.new(
          signal_id: ScanPackagePb::SignalId.new(id: "Cell2", signal_type: ScanPackagePb::SignalType::CELL),
          latitude_before: 47.6123896, longitude_before: -122.282069, accuracy_before: 10.699000358581543,
          latitude_after: 47.611294, longitude_after: -122.2827178, accuracy_after: 11.600000381469727,
          timestamp_before: Time.parse("2024-10-01T10:00:00Z"), timestamp_after: Time.parse("2024-10-01T10:00:01Z"),
          dbm: -55, snr: 1000
        ),
      ]
    ))

    # Key: <session_id>:<network_type>:<id>;<lat_5digits>;<long_5digits>
    cache_key = "#{scan.id}:cell:Cell1;47.61047,-122.33858"
    Rails.cache.write(cache_key, [-34], expires_in: 1.hour)

    headers = {"Content-Type" => "application/protobuf"}
    mobile_post(m_user, "/mobile_api/v1/scan_sessions/#{scan.id}/posts", headers: headers, params: pkg)

    assert_response :no_content
    assert_equal 1, scan.mobile_scan_network_measurements.count
    assert_equal "Cell2", scan.mobile_scan_network_measurements.first.mobile_scan_network.network_id
  end

  test "when post with wifi cache hit, expect it not saved" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    # 1 Access Point found -- 1 measurement
    pkg = ScanPackagePb::ScanPackage.encode(ScanPackagePb::ScanPackage.new(
      access_points: [
        ScanPackagePb::AccessPoint.new(id: "AP1-TestNet", bssid: "AP1", ssid: "TestNet", capabilities: "[WPA2-PSK]"),
      ],
      measurements: [
        ScanPackagePb::SignalMeasurement.new(
          signal_id: ScanPackagePb::SignalId.new(id: "AP1-TestNet", signal_type: ScanPackagePb::SignalType::WIFI),
          latitude_before: 47.6123896, longitude_before: -122.282069, accuracy_before: 10.699000358581543,
          latitude_after: 47.611294, longitude_after: -122.2827178, accuracy_after: 11.600000381469727,
          timestamp_before: Time.parse("2024-10-01T09:59:00Z"), timestamp_after: Time.parse("2024-10-01T09:59:10Z"),
          dbm: -80, snr: 2147483647
        ),
      ]
    ))

    Rails.cache.write("#{scan.id}:wifi:AP1-TestNet;47.61239,-122.28207", [-80, -30])

    headers = {"Content-Type" => "application/protobuf"}
    mobile_post(m_user, "/mobile_api/v1/scan_sessions/#{scan.id}/posts", headers: headers, params: pkg)

    assert_equal 0, scan.mobile_scan_network_measurements.count
  end

  test "when post with cache hit, but signal is different expect saved" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    # 1 Access Point found -- 1 measurement
    pkg = ScanPackagePb::ScanPackage.encode(ScanPackagePb::ScanPackage.new(
      access_points: [
        ScanPackagePb::AccessPoint.new(id: "AP1-TestNet", bssid: "AP1", ssid: "TestNet", capabilities: "[WPA2-PSK]"),
      ],
      measurements: [
        ScanPackagePb::SignalMeasurement.new(
          signal_id: ScanPackagePb::SignalId.new(id: "AP1-TestNet", signal_type: ScanPackagePb::SignalType::WIFI),
          latitude_before: 47.6123896, longitude_before: -122.282069, accuracy_before: 10.699000358581543,
          latitude_after: 47.611294, longitude_after: -122.2827178, accuracy_after: 11.600000381469727,
          timestamp_before: Time.parse("2024-10-01T09:59:00Z"), timestamp_after: Time.parse("2024-10-01T09:59:10Z"),
          dbm: -80, snr: 2147483647
        ),
      ]
    ))

    Rails.cache.write("#{scan.id}:wifi:AP1-TestNet;47.61238,-122.2820", [-30])

    headers = {"Content-Type" => "application/protobuf"}
    mobile_post(m_user, "/mobile_api/v1/scan_sessions/#{scan.id}/posts", headers: headers, params: pkg)

    assert_equal 1, scan.mobile_scan_network_measurements.count
  end

  test "when list sessions, expect user_device-only sessions" do
    m_user = mobile_user_device("test@test.com")
    m_user2 = mobile_user_device("test2@test.com")
    scan = scan_session(m_user)
    scan2 = scan_session(m_user2)

    mobile_get(m_user, "/mobile_api/v1/scan_sessions", params: {})

    assert_response :success
    assert_equal({
      "count" => 1,
      "items" => [
        serialize_scan_session(scan),
      ]
    }, @response.parsed_body)
  end

  test "whet get session details, expect response" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)

    mobile_get(m_user, "/mobile_api/v1/scan_sessions/#{scan.id}")

    assert_response :success
    assert_equal(
      serialize_scan_session(scan, details: true),
      @response.parsed_body
    )
  end

  test "when get session details from different user_device expect not found" do
    m_user = mobile_user_device("test@test.com")
    m_user2 = mobile_user_device("test2@test.com")
    scan = scan_session(m_user)

    mobile_get(m_user2, "/mobile_api/v1/scan_sessions/#{scan.id}")

    assert_response :not_found
  end

  test "when get scan session history, expect list of networks scanned" do
    m_user = mobile_user_device("test@test.com")
    older_scan = scan_session(m_user)
    newer_scan = scan_session(m_user)
    n1 = MobileScanNetwork.create(network_type: :cell, network_id: "Cell1", name: "Cell 1", cell_network_type: "GSM", cell_network_data_type: "LTE", found_by_session: older_scan)
    n2 = MobileScanNetwork.create(network_type: :cell, network_id: "Cell2", name: "Cell 2", cell_network_type: "CDMA", cell_network_data_type: "GSM", found_by_session: newer_scan)
    n3 = MobileScanNetwork.create(network_type: :wifi, network_id: "Wifi1", name: "Wifi 1", found_by_session: newer_scan)
    last_seen = Time.current

    session1_network1 = older_scan.mobile_scan_session_networks.create!(mobile_scan_network: n1, is_new: true, last_seen_at: last_seen)

    session2_network1 = newer_scan.mobile_scan_session_networks.create!(mobile_scan_network: n1, is_new: false, last_seen_at: last_seen)
    session2_network2 = newer_scan.mobile_scan_session_networks.create!(mobile_scan_network: n2, is_new: true, last_seen_at: last_seen)
    session2_network3 = newer_scan.mobile_scan_session_networks.create!(mobile_scan_network: n3, is_new: true, last_seen_at: last_seen)

    mobile_get(m_user, "/mobile_api/v1/scan_sessions/#{newer_scan.id}/history")

    assert_response :success
    assert_equal({
      "count" => 3,
      "items" => [
        {"id" => n1.id, "network_type" => "cell", "name" => "Cell 1", "is_new" => false, "last_seen_at" => serialize_datetime(last_seen)},
        {"id" => n2.id, "network_type" => "cell", "name" => "Cell 2", "is_new" => true, "last_seen_at" => serialize_datetime(last_seen)},
        {"id" => n3.id, "network_type" => "wifi", "name" => "Wifi 1", "is_new" => true, "last_seen_at" => serialize_datetime(last_seen)},
      ],
    }, @response.parsed_body)
  end

  test "when get scan session history filter by cell type, expect list of cell networks scanned" do
    m_user = mobile_user_device("test@test.com")
    older_scan = scan_session(m_user)
    newer_scan = scan_session(m_user)
    n1 = MobileScanNetwork.create(network_type: :cell, network_id: "Cell1", name: "Cell 1", cell_network_type: "GSM", cell_network_data_type: "LTE", found_by_session: older_scan)
    n2 = MobileScanNetwork.create(network_type: :cell, network_id: "Cell2", name: "Cell 2", cell_network_type: "CDMA", cell_network_data_type: "GSM", found_by_session: newer_scan)
    n3 = MobileScanNetwork.create(network_type: :wifi, network_id: "Wifi1", name: "Wifi 1", found_by_session: newer_scan)
    last_seen = Time.current

    session1_network1 = older_scan.mobile_scan_session_networks.create!(mobile_scan_network: n1, is_new: true, last_seen_at: last_seen)

    session2_network1 = newer_scan.mobile_scan_session_networks.create!(mobile_scan_network: n1, is_new: false, last_seen_at: last_seen)
    session2_network2 = newer_scan.mobile_scan_session_networks.create!(mobile_scan_network: n2, is_new: true, last_seen_at: last_seen)
    session2_network3 = newer_scan.mobile_scan_session_networks.create!(mobile_scan_network: n3, is_new: true, last_seen_at: last_seen)

    mobile_get(m_user, "/mobile_api/v1/scan_sessions/#{newer_scan.id}/history", params: {network_type: "cell"})

    assert_response :success
    assert_equal({
      "count" => 2,
      "items" => [
        {"id" => n1.id, "network_type" => "cell", "name" => "Cell 1", "is_new" => false, "last_seen_at" => serialize_datetime(last_seen)},
        {"id" => n2.id, "network_type" => "cell", "name" => "Cell 2", "is_new" => true, "last_seen_at" => serialize_datetime(last_seen)},
      ],
    }, @response.parsed_body)
  end

  test "when get scan session history filter by wifi type, expect list of cell networks scanned" do
    m_user = mobile_user_device("test@test.com")
    older_scan = scan_session(m_user)
    newer_scan = scan_session(m_user)
    n1 = MobileScanNetwork.create(network_type: :cell, network_id: "Cell1", name: "Cell 1", cell_network_type: "GSM", cell_network_data_type: "LTE", found_by_session: older_scan)
    n2 = MobileScanNetwork.create(network_type: :cell, network_id: "Cell2", name: "Cell 2", cell_network_type: "CDMA", cell_network_data_type: "GSM", found_by_session: newer_scan)
    n3 = MobileScanNetwork.create(network_type: :wifi, network_id: "Wifi1", name: "Wifi 1", found_by_session: newer_scan)
    last_seen = Time.current

    session1_network1 = older_scan.mobile_scan_session_networks.create!(mobile_scan_network: n1, is_new: true, last_seen_at: last_seen)

    session2_network1 = newer_scan.mobile_scan_session_networks.create!(mobile_scan_network: n1, is_new: false, last_seen_at: last_seen)
    session2_network2 = newer_scan.mobile_scan_session_networks.create!(mobile_scan_network: n2, is_new: true, last_seen_at: last_seen)
    session2_network3 = newer_scan.mobile_scan_session_networks.create!(mobile_scan_network: n3, is_new: true, last_seen_at: last_seen)

    mobile_get(m_user, "/mobile_api/v1/scan_sessions/#{newer_scan.id}/history", params: {network_type: "wifi"})

    assert_response :success
    assert_equal({
      "count" => 1,
      "items" => [
        {"id" => n3.id, "network_type" => "wifi", "name" => "Wifi 1", "is_new" => true, "last_seen_at" => serialize_datetime(last_seen)},
      ],
    }, @response.parsed_body)
  end
end
