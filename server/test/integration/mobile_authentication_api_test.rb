require "test_helper"

class MobileAuthenticationApiTest < ActionDispatch::IntegrationTest
  def mobile_user(email)
    User.create!(email: email, pods_access: false)
  end

  def mobile_session(email, device_id)
    user = mobile_user(email)
    MobileUserDevice.create!(user: user, device_id: device_id)
  end

  def verification_code(email, device_id)
    EmailVerificationCode.create!(email: email, device_id: device_id)
  end

  test "when authenticate called, expect 202" do
    device_id = SecureRandom.uuid
    post "/mobile_api/v1/authenticate/new_code", params: {email: "test@email.com", device_id: device_id}  
    assert_response :accepted

  end

  test "when new code requested, expect code model created" do
    device_id = SecureRandom.uuid
    post "/mobile_api/v1/authenticate/new_code", params: {email: "test@email.com", device_id: device_id}  
    
    assert_response :accepted
    code = EmailVerificationCode.pending_for_device("test@email.com", device_id)
    assert code.present?
    assert_not_nil code.code
    assert !code.expired?
  end

  test "when new code requested, expect email sent" do
    device_id = SecureRandom.uuid
    assert_emails 1 do
      post "/mobile_api/v1/authenticate/new_code", params: {email: "test@email.com", device_id: device_id}  
    end
  end

  test "when new code requested, expect existing expired" do
    device_id = SecureRandom.uuid
    previous_code = verification_code("test@email.com", device_id)
    post "/mobile_api/v1/authenticate/new_code", params: {email: "test@email.com", device_id: device_id}  

    new_code = EmailVerificationCode.pending_for_device("test@email.com", device_id)
    previous_code.reload
    assert previous_code.expired?
    assert_not_equal new_code, previous_code
  end


  test "when code token requested, and code valid, expect success" do
    device_id = SecureRandom.uuid
    code = verification_code("test@email.com", device_id)

    post "/mobile_api/v1/authenticate/get_token", params: { device_id: device_id, code: code.code }
    assert_response :success
    device = MobileUserDevice.find_by_device_id(device_id)
    assert_equal({ "token" => device.token }, @response.parsed_body)
  end

  test "when code token requested, and expired, expect error" do
    device_id = SecureRandom.uuid
    code = verification_code("test@email.com", device_id)
    code.update!(valid_until: Time.current)

    post "/mobile_api/v1/authenticate/get_token", params: { device_id: device_id, code: code.code }
    assert_response :unauthorized

    assert_equal({ "error" => "Validation code has expired.", "error_code" => "expired" }, @response.parsed_body)
  end

  test "when token requested, expect user and session created" do
    device_id = SecureRandom.uuid
    code = verification_code("test@email.com", device_id)

    post "/mobile_api/v1/authenticate/get_token", params: { device_id: device_id, code: code.code }

    user = User.find_by_email("test@email.com")
    assert user.present?
    assert !user.pods_access?

    device = MobileUserDevice.find_by(user: user, device_id: device_id)
    assert device.present?
    assert_not_nil device.token
    
  end

end
