ENV['RAILS_ENV'] ||= 'test'
require_relative "../config/environment"
require "rails/test_help"
require 'minitest/autorun'

class ActiveSupport::TestCase
  # Run tests in parallel with specified workers
  parallelize(workers: :number_of_processors)

  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  # Add more helper methods to be used by all tests here...

  include Devise::Test::IntegrationHelpers
  include Warden::Test::Helpers

  def sign_in_as(user)
    sign_in(user)
  end

  def set_up_geocoder
    Geocoder::Lookup::Test.add_stub(
      "New Address",
      [
        {
          'coordinates'  => [0.0, 0.0],
          'address'      => 'New Address',
          'state'        => 'New State',
          'state_code'   => 'NS',
          'country'      => 'United States',
          'country_code' => 'US',
          'county'       => 'New County'
        }
      ]
    )

    Geocoder::Lookup::Test.add_stub(
      [0.0, 0.0],
      [
        {
          'coordinates'  => [0.0, 0.0],
          'address'      => 'New Address',
          'state'        => 'New State',
          'state_code'   => 'NS',
          'country'      => 'United States',
          'country_code' => 'US',
          'county'       => 'New County'
        }
      ]
    )
  end

  def mobile_user(email)
    User.create!(email: email, pods_access: false)
  end

  def mobile_user_device(email, device_id=nil)
    device_id = device_id || SecureRandom.uuid
    user = mobile_user(email)
    MobileUserDevice.create!(user: user, device_id: device_id)
  end

  def scan_session(m_user)
    MobileScanSession.create(mobile_user_device: m_user)
  end

  def verification_code(email, m_user: nil, device_id: nil, reason: :new_token)
    device_id = device_id || m_user&.device_id
    EmailVerificationCode.create!(mobile_user_device: m_user, email: email, device_id: device_id, reason: reason)
  end

  [:get, :post, :put, :patch, :delete].each do |method|
    define_method "mobile_#{method}" do |m_user, url, **params|
      headers = params.fetch(:headers, {}).merge({"Authorization": "Bearer #{m_user.token}"})
      send(method, url, headers: headers, **params.except(:headers))
    end
  end

  def serialize_datetime(dt)
    dt.in_time_zone("UTC").strftime("%Y-%m-%dT%H:%M:%S.%LZ")
  end
end
