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

  test "when new result posted, expect record created" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    pkg = ScanPackagePb::ScanPackage.encode(ScanPackagePb::ScanPackage.new(
      cells: [
        ScanPackagePb::Cell.new(id: "Cell1"), 
        ScanPackagePb::Cell.new(id: "Cell2"),
      ]
    ))
    file = Rack::Test::UploadedFile.new(StringIO.new(pkg), "application/protobuf", original_filename: "message.proto")
    mobile_post(m_user, "/mobile_api/v1/scan_sessions/#{scan.id}/posts", params: {package: file})

    scan_post = scan.mobile_scan_session_posts.last
    
    assert_response :created
    assert scan_post.blob.attached?
    assert_equal({
      "id" => scan_post.id,
      "mobile_scan_session_id" => scan.id,
      "processed_at" => nil,
      "created_at" => serialize_datetime(scan_post.created_at),
      "updated_at" => serialize_datetime(scan_post.updated_at),
    }, @response.parsed_body)
  end

  test "when post for different user device, expect not found" do
    m_user = mobile_user_device("test@test.com")
    m_user2 = mobile_user_device("test2@test.com")
    scan = scan_session(m_user)
    pkg = ScanPackagePb::ScanPackage.new

    mobile_post(m_user2, "/mobile_api/v1/scan_sessions/#{scan.id}/posts", params: {
      package: ScanPackagePb::ScanPackage.encode(pkg),
    })

    assert_response :not_found
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

  test "when result posted, expect process job enqueued" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    pkg = ScanPackagePb::ScanPackage.encode(ScanPackagePb::ScanPackage.new(
      cells: [
        ScanPackagePb::Cell.new(id: "Cell1"), 
        ScanPackagePb::Cell.new(id: "Cell2"),
      ]
    ))
    file = Rack::Test::UploadedFile.new(StringIO.new(pkg), "application/protobuf", original_filename: "message.proto")

    assert_enqueued_with(job: ProcessScanSessionPostJob) do
      mobile_post(m_user, "/mobile_api/v1/scan_sessions/#{scan.id}/posts", params: {package: file})
    end
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
