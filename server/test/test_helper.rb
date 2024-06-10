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
end
