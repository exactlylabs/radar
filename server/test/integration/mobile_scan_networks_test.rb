require 'test_helper'

class MobileScanNetworksTest < ActionDispatch::IntegrationTest
  setup do
    Rails.cache.clear
  end

  def serialize_network(network, details: false)
    data = {
      "id" => network.id,
      "network_type" => network.network_type,
      "network_id" => network.network_id,
      "name" => network.name,
      "created_at" => serialize_datetime(network.created_at),
      "updated_at" => serialize_datetime(network.updated_at),
    }
    if details
      data["cell_network_type"] = network.cell_network_type
      data["cell_network_data_type"] = network.cell_network_data_type
      data["cell_channel"] = network.cell_channel
      data["wifi_security"] = network.wifi_security
      data["wifi_mac"] = network.wifi_mac
      data["wifi_channel_width"] = network.wifi_channel_width
      data["wifi_frequency"] = network.wifi_frequency
      data["wifi_center_freq0"] = network.wifi_center_freq0
      data["wifi_center_freq1"] = network.wifi_center_freq1
      data["last_seen_at"] = network.last_seen_at
      data["first_seen_at"] = network.first_seen_at
      data["accuracy"] = network.accuracy
      data["address_line1"] = network.address_line1
      data["address_line2"] = network.address_line2
      data["seen_count"] = network.mobile_scan_sessions.count
      data["latitude"] = network.lonlat.latitude
      data["longitude"] = network.lonlat.longitude
    end

    data
  end

  test "when list networks, expect content" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)

    net1 = MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test123", name: "Test1", lonlat: "POINT(-125 45)",
      found_by_session: scan,
    )
    net2 = MobileScanNetwork.create!(
      network_type: :wifi, network_id: "Test231", name: "Test2", lonlat: "POINT(-125 45)",
      found_by_session: scan,
    )
    scan.mobile_scan_networks << [net1, net2]

    mobile_get(m_user, "/mobile_api/v1/networks/")

    assert_response :success

    result = @response.parsed_body

    assert_equal 2, result["count"]
    assert_equal [serialize_network(net1), serialize_network(net2)], result["items"]
  end

  test "when list networks filtered by net_type and id, expect response" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)

    net1 = MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test123", name: "Test1", lonlat: "POINT(-125 45)",
      found_by_session: scan,
    )
    net2 = MobileScanNetwork.create!(
      network_type: :wifi, network_id: "Test231", name: "Test2", lonlat: "POINT(-125 45)",
      found_by_session: scan,
    )

    mobile_get(m_user, "/mobile_api/v1/networks/", params: {network_type: :wifi, network_id: "Test231"})
    assert_response :success

    result = @response.parsed_body
    assert_equal 1, result["count"]
    assert_equal [serialize_network(net2)], result["items"]
  end

  test "when show network details, expect content" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)

    net1 = MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test123", name: "Test1", lonlat: "POINT(-125 45)",
      found_by_session: scan,
    )
    scan.mobile_scan_networks << net1

    mobile_get(m_user, "/mobile_api/v1/networks/#{net1.id}")

    assert_response :success
    assert_equal serialize_network(net1, details: true), @response.parsed_body
  end

  test "when show network details wrong id, expect not found" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)

    net1 = MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test123", name: "Test1", lonlat: "POINT(-125 45)",
      found_by_session: scan,
    )
    scan.mobile_scan_networks << net1

    mobile_get(m_user, "/mobile_api/v1/networks/0")
    assert_response :not_found
  end

  test "when show carrier names, expect response" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test1", name: "Test1", lonlat: "POINT(-120 45)",
      found_by_session: scan,
    )
    MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test2", name: "Test2", lonlat: "POINT(-122 45)",
      found_by_session: scan,
    )

    mobile_get(m_user, "/mobile_api/v1/networks/carriers")

    assert_response :success

    assert_equal(
      {"items" => [{"name" => "Test1"}, {"name" => "Test2"}]},
      response.parsed_body
    )
  end

  test "when show carrier names with bounding box, expect filtered" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test1", name: "Test1", lonlat: "POINT(-120 45)",
      found_by_session: scan,
    )
    MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test2", name: "Test2", lonlat: "POINT(-122 45)",
      found_by_session: scan,
    )

    mobile_get(m_user, "/mobile_api/v1/networks/carriers", params: {bbox: [-120, 70, 120, -70]})

    assert_response :success

    assert_equal(
      {"items" => [{"name" => "Test1"}]},
      response.parsed_body
    )
  end

  test "when vector tiles requested, expect response" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test1", name: "Test1", lonlat: "POINT(-120 45)",
      found_by_session: scan,
    )
    MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test2", name: "Test2", lonlat: "POINT(-122 45)",
      found_by_session: scan,
    )

    mobile_get(m_user, "/mobile_api/v1/networks/tiles/0/0/0")

    assert_response :success
    assert_equal 'application/vnd.mapbox-vector-tile', response.content_type
    assert_not_nil response.body
  end

  test "when vector tiles requested, expect response cached" do
    m_user = mobile_user_device("test@test.com")
    scan = scan_session(m_user)
    MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test1", name: "Test1", lonlat: "POINT(-120 45)",
      found_by_session: scan,
    )
    MobileScanNetwork.create!(
      network_type: :cell, network_id: "Test2", name: "Test2", lonlat: "POINT(-122 45)",
      found_by_session: scan,
    )

    mobile_get(m_user, "/mobile_api/v1/networks/tiles/0/0/0")

    keys = Rails.cache.delete_matched("/mvt/MobileScanNetwork/0/0/0/*")
    assert_equal 1, keys.length
  end
end
