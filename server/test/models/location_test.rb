require "test_helper"

class LocationTest < ActiveSupport::TestCase
  setup do
    Geocoder::Lookup::Test.set_default_stub([{
      'coordinates'  => [40.7143528, -74.0059731],
      'address'      => 'Somewhere',
      'state'        => 'State',
      'state_code'   => 'ST',
      'country'      => 'United States',
      'country_code' => 'US',
      "county" => "County"
    }])
  end


  test "when location created with lonlat expect Reprocess Geospaces job to be called" do
    job = lambda { |location| assert location.lonlat.present? }
    ReprocessNetworkGeospaceJob.stub :perform_later, job do
      Location.create!(
        name: "Test", address: "Somewhere", lonlat: "POINT(1 1)",
        account: accounts(:root), created_by_id: users(:user1).id
      )
    end
  end

  test "when location updated with lonlat kept the same, expect job to not be called" do
    ReprocessNetworkGeospaceJob.stub :perform_later, proc { |l| raise "Should not be called" } do
      locations(:online1).update!(name: "NewName")
    end
  end

  test "when location updated with lonlat change, expect job to be called" do
    mock = MiniTest::Mock.new
    mock.expect(:call, nil, [locations(:online1)])
    ReprocessNetworkGeospaceJob.stub :perform_later, mock do
      locations(:online1).update!(lonlat: "POINT(40.5 1)")
    end
  end
end
