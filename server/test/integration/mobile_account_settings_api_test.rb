require "test_helper"

class MobileAccountSettingsApiTest < ActionDispatch::IntegrationTest
  test "when change email requested without auth, expect 401" do
    post "/mobile_api/v1/user/email", params: { email: "test+new@test.com" }
    assert_response :unauthorized
  end

  test "when change email requested, expect email code generated" do
    m_user = mobile_user_device("test@test.com")
    mobile_post(m_user, "/mobile_api/v1/user/email", params: {email: "test+new@test.com"})
    assert_response :accepted

    code = EmailVerificationCode.pending_change_email_for_user(m_user)
    assert code.present?
    assert !code.expired?
  end

  test "when change email requested, expect email sent" do
    m_user = mobile_user_device("test@test.com")
    assert_emails 1 do
      mobile_post(m_user, "/mobile_api/v1/user/email", params: {email: "test+new@test.com"})
    end
  end

  test "when change email requested, and previous code sent. Expect it to expire" do
    m_user = mobile_user_device("test@test.com")
    previous_code = verification_code("test+new@test.com", m_user: m_user, reason: :change_email)

    mobile_post(m_user, "/mobile_api/v1/user/email", params: {email: "test+new@test.com"})
    
    new_code = EmailVerificationCode.pending_change_email_for_user(m_user)
    previous_code.reload

    assert previous_code.expired?
    assert_not_equal new_code, previous_code
  end

  test "when change email code sent, and code valid, expect user email changed" do
    m_user = mobile_user_device("test@test.com")
    code = verification_code("test+new@test.com", m_user: m_user, reason: :change_email)

    mobile_post(m_user, "/mobile_api/v1/user/email/validate", params: {code: code.code})
  
    code.reload
    m_user.reload

    assert_response :success
    assert code.expired?
    assert_equal "test+new@test.com", m_user.user.email
  end

  test "when change email code sent, and code invalid, expect 404 with not_found code error" do
    m_user = mobile_user_device("test@test.com")
    code = verification_code("test+new@test.com", m_user: m_user, reason: :change_email)

    mobile_post(m_user, "/mobile_api/v1/user/email/validate", params: {code: code})
    assert_response :not_found

    assert_equal({
      "error" => "Change email request not found.", "error_code" => "not_found"
    }, @response.parsed_body)
  end

  test "when patch settings sent with lon/lat, expect just home_lonlat updated" do
    m_user = mobile_user_device("test@test.com")
    mobile_patch(m_user, "/mobile_api/v1/user/settings", params: {home_latitude: 47, home_longitude: -122})

    assert_response :success

    assert_not_nil m_user.user.mobile_account_settings.home_lonlat
    assert_equal 47, m_user.user.mobile_account_settings.home_lonlat.latitude
    assert_equal -122, m_user.user.mobile_account_settings.home_lonlat.longitude
    assert_nil m_user.user.mobile_account_settings.mobile_monthly_cost
    assert_nil m_user.user.mobile_account_settings.fixed_expected_download
    assert_nil m_user.user.mobile_account_settings.fixed_expected_upload
    assert_nil m_user.user.mobile_account_settings.fixed_monthly_cost
  end

  test "when patch with all settings, expect data updated" do
    m_user = mobile_user_device("test@test.com")
    mobile_patch(m_user, "/mobile_api/v1/user/settings", params: {
      home_latitude: 23.4, home_longitude: 11.9,
      mobile_monthly_cost: 14.4,
      fixed_expected_download: 500.0,
      fixed_expected_upload: 300.0,
      fixed_monthly_cost: 49.99,
    })

    assert_response :success
    assert_equal 23.4, m_user.user.mobile_account_settings.home_lonlat.latitude
    assert_equal 11.9, m_user.user.mobile_account_settings.home_lonlat.longitude
    assert_equal 14.4, m_user.user.mobile_account_settings.mobile_monthly_cost
    assert_equal 500.0, m_user.user.mobile_account_settings.fixed_expected_download
    assert_equal 300.0, m_user.user.mobile_account_settings.fixed_expected_upload
    assert_equal 49.99, m_user.user.mobile_account_settings.fixed_monthly_cost
  end
end