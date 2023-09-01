require "test_helper"

class LocationsControllerTest < ActionDispatch::IntegrationTest

  setup do
    UsersAccount.create!(user_id: users(:superuser1).id, account_id: accounts(:root).id, joined_at: Time.now, invited_at: Time.now)
    sign_in_as users(:superuser1)
  end

  test "When_location_is_updated_with_category_Expect_categories_to_be_assigned" do
    params = {
      location: {
        name: "Test Location", address: "Nome", manual_lat_long: 0, automatic_location: false,
        latitude: "", longitude: "", expected_mbps_up: 400.0, expected_mbps_down: 400.0
        },
        categories: ",#{categories(:category1).id}",
        commit: "Update",
        id: "#{locations(:online1).id}",
        format: :turbo_stream
    }
    put location_url(locations(:online1)), params: params
    assert_response :success
    assert_equal locations(:online1).categories.count, 1
    assert_equal locations(:online1).categories.first.id, categories(:category1).id
  end

end
