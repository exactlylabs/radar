require "test_helper"

class ClientTest < ActiveSupport::TestCase
  test "when client and location are from different account expect failure" do
    location = locations(:different_account)
    client = clients(:pod1)
    client.location = location
    assert !client.save
  end

  test "when client and location are from same account expect success" do
    location = locations(:online1)
    client = clients(:pod1)
    client.location = location
    assert client.save
  end

  test "when client location changed, and offline, expect ip and autonomous_system to be cleared" do
    client = clients(:offline_with_autonomous_system_and_location)
    client.update!(location: nil)
    client.reload
    assert_nil client.ip
    assert_nil client.autonomous_system
  end

  test "when client location changed, and online, expect ip and autonomous_system to not be cleared" do
    client = clients(:online_with_autonomous_system_and_location)
    client.update!(location: nil)
    client.reload
    assert_not_nil client.ip
    assert_not_nil client.autonomous_system
  end
end

class ClientLatestMeasurementPreloadTest < ActiveSupport::TestCase
  test "preload_latest_measurements matches latest_measurement, with and without an account" do
    with_account = clients(:online_with_autonomous_system_and_location)
    without = clients(:no_account)
    without.update_columns(account_id: nil)
    now = Time.current
    # Older complete, newest complete, a newer one with no download (ignored) and one under
    # another account (ignored): the latest is the newest complete one of the client's account.
    Measurement.create!(client: with_account, account_id: with_account.account_id, download: 1, upload: 1, created_at: now - 3.hours, updated_at: now)
    expected = Measurement.create!(client: with_account, account_id: with_account.account_id, download: 2, upload: 2, created_at: now - 2.hours, updated_at: now)
    Measurement.create!(client: with_account, account_id: with_account.account_id, download: nil, upload: 3, created_at: now - 1.hour, updated_at: now)
    Measurement.create!(client: with_account, account_id: accounts(:superaccount).id, download: 4, upload: 4, created_at: now, updated_at: now)
    expected_none = Measurement.create!(client: without, account_id: nil, download: 5, upload: 5, created_at: now - 1.hour, updated_at: now)

    loaded = Client.preload_latest_measurements(Client.where(id: [with_account.id, without.id]).order(:id))
    by_id = loaded.index_by(&:id)
    assert_equal expected, by_id[with_account.id].latest_measurement
    assert_equal expected_none, by_id[without.id].latest_measurement
    # The same answers as the per-client query.
    assert_equal expected, Client.find(with_account.id).latest_measurement
    assert_equal expected_none, Client.find(without.id).latest_measurement
    # A preloaded client answers without a query; a fresh one still queries.
    queries = 0
    ActiveSupport::Notifications.subscribed(->(*) { queries += 1 }, "sql.active_record") { by_id[with_account.id].latest_measurement }
    assert_equal 0, queries
    assert_equal [], Client.preload_latest_measurements(Client.none)
  end
end
