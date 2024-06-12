require 'test_helper'

class ClientsControllersTest < ActionDispatch::IntegrationTest
  setup do
    UsersAccount.create!(user_id: users(:superuser1).id, account_id: accounts(:root).id, joined_at: Time.now, invited_at: Time.now)
    UsersAccount.create!(user_id: users(:user1).id, account_id: accounts(:root).id, joined_at: Time.now, invited_at: Time.now)
    sign_in_as users(:superuser1)
    feature_flags(:networks).update(generally_available: true)
  end

  test "when get no_account details and super user expect success" do
    get client_url(clients(:no_account).unix_user)
    assert_response :success
  end

  test "when get no_account details and non super user expect not found" do
    sign_in_as users(:user1)
    assert_raises(ActiveRecord::RecordNotFound) do
      get client_url(clients(:no_account).unix_user)
    end
  end

  test "when pod released from details page expect redirection" do
    delete release_client_url(clients(:pod1).unix_user), headers: { "HTTP_REFERER" => client_url(clients(:pod1).unix_user) }
    assert_redirected_to clients_url
  end

  test "when pod released expect state cleared" do
    clients(:pod1).update!(
      download_avg: 10,
      upload_avg: 10,
      data_cap_max_usage: 100,
      data_cap_periodicity: :weekly,
      data_cap_current_period_usage: 5,
      data_cap_current_period: Time.now,
      scheduling_periodicity: :scheduler_daily,
      scheduling_amount_per_period: 5,
      scheduling_tests_in_period: 10,
      scheduling_period_end: Time.now,
      measurements_count: 100,
      measurements_download_sum: 444,
      measurements_upload_sum: 444,
      test_allowed_time_start: Time.now,
      test_allowed_time_end: Time.now,
      test_allowed_time_tz: "America/Sao_Paulo",
      register_label: "Test"
    )
    delete release_client_url(clients(:pod1).unix_user), headers: { "HTTP_REFERER" => client_url(clients(:pod1).unix_user) }

    clients(:pod1).reload
    assert_nil clients(:pod1).account
    assert_nil clients(:pod1).location
    assert_nil clients(:pod1).user
    assert_nil clients(:pod1).autonomous_system
    assert_nil clients(:pod1).download_avg
    assert_nil clients(:pod1).upload_avg
    assert_nil clients(:pod1).data_cap_max_usage
    assert_equal clients(:pod1).data_cap_periodicity, "daily"
    assert_equal clients(:pod1).data_cap_current_period_usage, 0
    assert_nil clients(:pod1).data_cap_current_period
    assert_equal clients(:pod1).scheduling_periodicity, "scheduler_hourly"
    assert_equal clients(:pod1).scheduling_amount_per_period, 1
    assert_equal clients(:pod1).scheduling_tests_in_period, 0
    assert_nil clients(:pod1).scheduling_period_end
    assert_equal clients(:pod1).measurements_count, 0
    assert_equal clients(:pod1).measurements_download_sum, 0
    assert_equal clients(:pod1).measurements_upload_sum, 0
    assert_nil clients(:pod1).test_allowed_time_start
    assert_nil clients(:pod1).test_allowed_time_end
    assert_nil clients(:pod1).test_allowed_time_tz
    assert_nil clients(:pod1).register_label
  end

  test "when bulk deleted expect account, location, user, and isp set to nil" do
    delete bulk_delete_clients_url, params: { ids: [clients(:pod1).unix_user, clients(:pod2).unix_user].to_json }

    clients(:pod1).reload
    clients(:pod2).reload
    assert_nil clients(:pod1).account
    assert_nil clients(:pod1).location
    assert_nil clients(:pod1).user
    assert_nil clients(:pod1).autonomous_system

    assert_nil clients(:pod2).account
    assert_nil clients(:pod2).location
    assert_nil clients(:pod2).user
    assert_nil clients(:pod2).autonomous_system

  end
end
