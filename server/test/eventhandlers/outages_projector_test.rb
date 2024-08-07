require 'test_helper.rb'

class OutagesProjectorTest < ActiveSupport::TestCase
  def setup
  end

  def set_state(state)
    ConsumerOffset.create!(consumer_id: 'OutagesProjector', state: state)
  end

  def event_data(name, pod_id, location_id, as_id, timestamp: nil)
    {
      "aggregate_id" => pod_id,
      "snapshot_id" => 1,
      "name" => name,
      "snapshot_state" => {
        "location_id" => location_id,
        "autonomous_system_id" => as_id,
        "online" => false,
      },
      "timestamp" => timestamp || Time.new(2024, 8, 1)
    }
  end

  test "when offline location event, unknown_failure created" do
    pod_id = 1
    location = locations(:outage_location1)
    as = autonomous_systems(:outage_as1)
    event = event_data("WENT_OFFLINE", pod_id, location.id, as.id)

    set_state({
      "pods": {pod_id.to_s => {}},
      "network_pods" => {
        "#{location.id}" => [pod_id],
      }
    })
    
    assert_changes 'NetworkOutage.active.count' do
      OutagesProjector.new.handle_client_event(event)
    end
    o = NetworkOutage.last
    assert_equal o.location_id, location.id
    assert o.active?
    assert o.unknown_reason?
  end

  test "when existing outage and offline event, nothing created" do
    pod_id = 1
    location = locations(:outage_location1)
    as = autonomous_systems(:outage_as1)
    event = event_data("WENT_OFFLINE", pod_id, location.id, as.id)
    NetworkOutage.create!(
      location_id: location.id,
      status: :active, 
      outage_type: :unknown_reason, 
      started_at: Time.new(2024, 1, 1),
    )
    # Projector state
    set_state({
      "pods": {pod_id.to_s => {}},
      "network_pods" => {
        "#{location.id}" => [pod_id],
      }
    })
    assert_no_changes 'NetworkOutage.active.count' do
      OutagesProjector.new.handle_client_event(event)
    end
  end

  test "when pod goes online, outage resolved" do
    pod_id = 1
    location = locations(:outage_location1)
    as = autonomous_systems(:outage_as1)
    event = event_data("WENT_ONLINE", pod_id, location.id, as.id)
    outage = NetworkOutage.create!(
      location_id: location.id,
      status: :active, 
      outage_type: :unknown_reason, 
      started_at: Time.new(2024, 1, 1),
    )
    # Projector state
    set_state({
      "pods": {pod_id.to_s => {}},
      "network_pods" => {
        "#{location.id}" => [pod_id],
      }
    })
    assert_no_changes 'NetworkOutage.count' do
      OutagesProjector.new.handle_client_event(event)
    end

    outage.reload
    assert outage.resolved?
    assert outage.network_failure?
    assert_equal event["timestamp"], outage.resolved_at
  end

  test "when pod goes offline, but location has online pods, nothing created" do
    pod_id = 1
    location = locations(:outage_location1)
    as = autonomous_systems(:outage_as1)
    event = event_data("WENT_ONLINE", pod_id, location.id, as.id)

    # Projector state
    set_state({
      "pods": {pod_id.to_s => {}, "2" => {"online" => true}},
      "network_pods" => {
        "#{location.id}" => [pod_id, 2],
      }
    })
    assert_no_changes 'NetworkOutage.count' do
      OutagesProjector.new.handle_client_event(event)
    end
  end

  test "when service started event and ongoing outage, expect flag set" do
    pod_id = 1
    location = locations(:outage_location1)
    as = autonomous_systems(:outage_as1)
    event = event_data("SERVICE_STARTED", pod_id, location.id, as.id)
    no = NetworkOutage.create!(
      location_id: location.id,
      status: :active, 
      outage_type: :unknown_reason, 
      started_at: Time.new(2024, 1, 1),
    )

    set_state({
      "pods": {pod_id.to_s => {}},
      "network_pods" => {
        "#{location.id}" => [pod_id],
      }
    })
    assert_no_changes 'NetworkOutage.count' do
      OutagesProjector.new.handle_client_event(event)
    end
    no.reload
    assert no.has_service_started_event?
  end

  test "when service_started_event is true and got online, expect power outage" do
    pod_id = 1
    location = locations(:outage_location1)
    as = autonomous_systems(:outage_as1)
    event = event_data("WENT_ONLINE", pod_id, location.id, as.id)
    no = NetworkOutage.create!(
      location_id: location.id,
      status: :active, 
      outage_type: :unknown_reason, 
      started_at: Time.new(2024, 1, 1),
      has_service_started_event: true,
    )
    set_state({
      "pods": {pod_id.to_s => {}},
      "network_pods" => {
        "#{location.id}" => [pod_id],
      }
    })
    assert_no_changes 'NetworkOutage.count' do
      OutagesProjector.new.handle_client_event(event)
    end
    no.reload
    assert no.power_outage?
    assert no.resolved?
  end

  test "when network failure, but followed by service started, expect changed to power outage" do
    pod_id = 1
    location = locations(:outage_location1)
    as = autonomous_systems(:outage_as1)
    no = NetworkOutage.create!(
      location_id: location.id,
      status: :resolved, 
      outage_type: :network_failure, 
      started_at: Time.new(2024, 1, 1),
      resolved_at: Time.new(2024, 1, 2),
      has_service_started_event: false,
    )
    set_state({
      "pods": {pod_id.to_s => {}},
      "network_pods" => {
        "#{location.id}" => [pod_id],
      }
    })
    event = event_data("SERVICE_STARTED", pod_id, location.id, as.id, timestamp: no.resolved_at + 1.second)
    assert_no_changes 'NetworkOutage.count' do
      OutagesProjector.new.handle_client_event(event)
    end
    no.reload
    assert no.power_outage?
    assert no.resolved?
  end

  test "when network outage within existing isp outage, expect it gets assigned" do
    network_outage = NetworkOutage.create!(
      outage_type: :network_failure,
      location: locations(:outage_location1),
      autonomous_system: autonomous_systems(:outage_as1),
      status: :resolved,
      started_at: Time.new(2024, 7, 1),
      resolved_at: Time.new(2024, 8, 1),
    )
    isp_outage = IspOutage.create!(
      autonomous_system: autonomous_systems(:outage_as1),
      offline_window_start: network_outage.started_at - 1.minute,
      offline_window_end: network_outage.started_at + 2.minute,
      online_window_start: network_outage.resolved_at - 2.minute,
      online_window_end: network_outage.resolved_at + 1.minute,
    )

    OutagesProjector.new.detect_isp_outage(network_outage)
    network_outage.reload

    assert network_outage.isp_outage?
    assert_equal network_outage.isp_outage, isp_outage
  end

  test "when network outage not within existing isp outage, expect nothing changes" do
    network_outage = NetworkOutage.create!(
      outage_type: :network_failure,
      location: locations(:outage_location1),
      autonomous_system: autonomous_systems(:outage_as1),
      status: :resolved,
      started_at: Time.new(2024, 7, 1),
      resolved_at: Time.new(2024, 8, 1),
    )
    isp_outage = IspOutage.create!(
      autonomous_system: autonomous_systems(:outage_as1),
      offline_window_start: network_outage.started_at + 4.minute,
      offline_window_end: network_outage.started_at + 6.minute, # Start is out of the range
      online_window_start: network_outage.resolved_at - 2.minute,
      online_window_end: network_outage.resolved_at + 1.minute,
    )

    OutagesProjector.new.detect_isp_outage(network_outage)
    network_outage.reload

    assert network_outage.network_failure?
    assert_nil network_outage.isp_outage
  end

  test "when 4 network outages within online and offline window, expect new isp outage" do
    network_outage1 = NetworkOutage.create!(
      outage_type: :network_failure,
      location: locations(:outage_location1),
      autonomous_system: autonomous_systems(:outage_as1),
      status: :resolved,
      started_at: Time.new(2024, 7, 1),
      resolved_at: Time.new(2024, 8, 1),
    )

    network_outage2 = NetworkOutage.create!(
      outage_type: :network_failure,
      location: locations(:outage_location2),
      autonomous_system: autonomous_systems(:outage_as1),
      status: :resolved,
      started_at: Time.new(2024, 7, 1) + 0.3.minute,
      resolved_at: Time.new(2024, 8, 1) - 0.5.minute,
    )

    network_outage3 = NetworkOutage.create!(
      outage_type: :network_failure,
      location: locations(:outage_location3),
      autonomous_system: autonomous_systems(:outage_as1),
      status: :resolved,
      started_at: Time.new(2024, 7, 1) + 0.5.minute,
      resolved_at: Time.new(2024, 8, 1) + 0.6.minute,
    )

    network_outage4 = NetworkOutage.create!(
      outage_type: :network_failure,
      location: locations(:outage_location4),
      autonomous_system: autonomous_systems(:outage_as1),
      status: :resolved,
      started_at: Time.new(2024, 7, 1) + 0.9.minute,
      resolved_at: Time.new(2024, 8, 1) + 0.9.minute,
    )
    
    assert_changes 'IspOutage.count' do
      OutagesProjector.new.detect_isp_outage(network_outage3)
    end

    network_outage1.reload
    network_outage2.reload
    network_outage3.reload
    network_outage4.reload
    assert network_outage1.isp_outage?
    assert network_outage2.isp_outage?
    assert network_outage3.isp_outage?
    assert network_outage4.isp_outage?

  end

  test "when some outages not within online and offline window, expect no new isp outage" do
    network_outage1 = NetworkOutage.create!(
      outage_type: :network_failure,
      location: locations(:outage_location1),
      autonomous_system: autonomous_systems(:outage_as1),
      status: :resolved,
      started_at: Time.new(2024, 7, 1),
      resolved_at: Time.new(2024, 8, 1),
    )

    network_outage2 = NetworkOutage.create!(
      outage_type: :network_failure,
      location: locations(:outage_location2),
      autonomous_system: autonomous_systems(:outage_as1),
      status: :resolved,
      started_at: Time.new(2024, 7, 1) + 0.3.minute,
      resolved_at: Time.new(2024, 8, 1) - 0.5.minute,
    )

    network_outage3 = NetworkOutage.create!(
      outage_type: :network_failure,
      location: locations(:outage_location3),
      autonomous_system: autonomous_systems(:outage_as1),
      status: :resolved,
      started_at: Time.new(2024, 7, 1) + 0.5.minute,
      resolved_at: Time.new(2024, 8, 1) + 0.6.minute,
    )

    network_outage3 = NetworkOutage.create!(
      outage_type: :network_failure,
      location: locations(:outage_location4),
      autonomous_system: autonomous_systems(:outage_as1),
      status: :resolved,
      started_at: Time.new(2024, 7, 1) + 2.minute,
      resolved_at: Time.new(2024, 8, 1) + 0.9.minute,
    )
    
    assert_no_changes 'IspOutage.count' do
      OutagesProjector.new.detect_isp_outage(network_outage3)
    end
  end
end