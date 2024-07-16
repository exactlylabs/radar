require "test_helper"

class ClientsControllerTest < ActionDispatch::IntegrationTest

  setup do
    sign_in_as users(:superuser1)
    set_up_geocoder
  end

  test "Test_check_claim_When_given_an_invalid_client_unix_user_Expect_a_404" do
    post(check_claim_clients_path, params: { id: "1nv4l1d1D" }, as: :json)
    assert_response :not_found
  end

  test "Test_check_claim_When_given_no_client_unix_user_Expect_a_404" do
    post(check_claim_clients_path, params: { id: nil }, as: :json)
    assert_response :not_found
  end

  test "Test_check_claim_When_given_an_already_claimed_client_unix_user_Expect_a_400_with_correct_message" do
    post(check_claim_clients_path, params: { id: clients(:pod1).unix_user }, as: :json)
    assert_response :bad_request
    assert_equal response.parsed_body["msg"], "Client already claimed!"
  end

  test "Test_check_claim_When_given_a_non_claimed_client_unix_user_Expect_a_200" do
    post(check_claim_clients_path, params: { id: clients(:unclaimed).unix_user }, as: :json)
    assert_response :ok
  end

  test "Test_claim_When_given_an_invalid_client_unix_user_Expect_a_422" do
    post(claim_clients_path, params: { id: "1nv4l1d1D" }, as: :html)
    assert_response :unprocessable_entity
  end

  test "Test_claim_When_given_an_already_assigned_client_unix_user_Expect_a_422" do
    params = {
      id: clients(:pod1).unix_user,
      location_id: locations(:online1).id,
      name: "Claimed Pod",
      account_id: accounts(:root).id,
    }
    post(claim_clients_path, params: params, as: :html)
    assert_response :unprocessable_entity
  end

  test "Test_claim_When_given_an_mismatching_account_and_network_user_Expect_a_400" do
    params = {
      id: clients(:pod1).unix_user,
      location_id: locations(:online1).id,
      name: "Claimed Pod",
      account_id: accounts(:exportaccount).id,
    }
    post(claim_clients_path, params: params, as: :html)
    assert_response :bad_request
  end

  test "Test_claim_When_given_valid_data_Expect_a_200_and_client_to_be_set_correctly" do
    params = {
      id: clients(:unclaimed).unix_user,
      location_id: locations(:online1).id,
      name: "Claimed Pod",
      account_id: accounts(:root).id,
    }
    post(claim_clients_path, params: params, as: :json)
    assert_response :ok
    updated_pod = clients(:unclaimed).reload
    assert_equal updated_pod.location.id, locations(:online1).id
    assert_equal updated_pod.name, "Claimed Pod"
    assert_equal updated_pod.account.id, accounts(:root).id
  end

  test "Test_update_When_given_an_invalid_client_id_Expect_a_not_found_raise" do
    assert_raise ActiveRecord::RecordNotFound do
      put(client_path("1nv4l1d1D"), params: { id: "1nv4l1d1D" }, as: :html)
    end
  end

  test "Test_update_When_given_an_invalid_network_assignment_type_Expect_a_422" do
    params = {
      account_id: accounts(:root).id,
      network_id: locations(:online1).id,
      network_assignment_type: "1nv4l1d1D",
      categories: [categories(:category1).id],
      location: { name: "New Location" }
    }
    put(client_path(clients(:pod1).unix_user), params: params, as: :html)
    assert_response :unprocessable_entity
  end

  test "Test_update_When_given_no_network_assignment_type_Expect_pod_to_get_updated_correctly" do
    params = {
      account_id: accounts(:root).id,
      network_id: locations(:online1).id, # I can send nil but want to really check if it's being set as empty
      network_assignment_type: PodsHelper::PodAssignmentType::NoNetwork,
      categories: [categories(:category1).id],
      location: { name: "New Location" }
    }
    put(client_path(clients(:pod1).unix_user), params: params, as: :html)
    assert_response :redirect
    updated_pod = clients(:pod1).reload
    assert_nil updated_pod.location
    assert_equal updated_pod.account.id, accounts(:root).id
    assert_equal updated_pod.user.id, users(:user1).id
  end

  test "Test_update_When_given_existing_network_assignment_type_Expect_pod_to_get_updated_correctly" do
    params = {
      account_id: accounts(:root).id,
      network_id: locations(:online1).id,
      network_assignment_type: PodsHelper::PodAssignmentType::ExistingNetwork,
      categories: [categories(:category1).id],
      location: { name: "New Location" }
    }
    put(client_path(clients(:pod1).unix_user), params: params, as: :html)
    assert_response :redirect
    updated_pod = clients(:pod1).reload
    assert_equal updated_pod.location.id, locations(:online1).id
    assert_equal updated_pod.account.id, accounts(:root).id
    assert_equal updated_pod.user.id, users(:user1).id
  end

  test "Test_update_When_given_existing_network_assignment_type_and_mismatching_accounts_Expect_pod_to_get_updated_correctly" do
    params = {
      account_id: accounts(:root).id,
      network_id: locations(:different_account).id,
      network_assignment_type: PodsHelper::PodAssignmentType::ExistingNetwork,
      categories: [categories(:category1).id],
      location: { name: "New Location" }
    }
    put(client_path(clients(:pod1).unix_user), params: params, as: :html)
    assert_response :redirect
    updated_pod = clients(:pod1).reload
    assert_equal updated_pod.location.id, locations(:different_account).id
    assert_equal updated_pod.account.id, accounts(:superaccount).id
    assert_equal updated_pod.user.id, users(:user1).id
  end

  test "Test_update_When_given_new_network_assignment_type_Expect_pod_to_get_updated_correctly" do
    params = {
      account_id: accounts(:root).id,
      network_id: nil,
      network_assignment_type: PodsHelper::PodAssignmentType::NewNetwork,
      categories: categories(:category1).id.to_s,
      location: {
        name: "New Location",
        address: "New Address",
        manual_lat_long: 0,
        expected_mbps_up: 100,
        expected_mbps_down: 100,
        latitude: 0,
        longitude: 0,
        account_id: accounts(:root).id,
      }
    }
    put(client_path(clients(:pod1).unix_user), params: params, as: :html)
    assert_response :redirect
    updated_pod = clients(:pod1).reload
    new_network = Location.find_by(name: "New Location")
    assert_equal updated_pod.location.id, new_network.id
    assert_equal updated_pod.account.id, new_network.account.id
    assert_equal updated_pod.user.id, users(:user1).id
    assert_equal new_network.clients.count, 1
    assert_equal new_network.clients.first.unix_user, clients(:pod1).unix_user
    assert_equal new_network.user.id, 1
    assert_equal new_network.account.id, accounts(:root).id
    assert_equal new_network.categories.count, 1
    assert_equal new_network.categories.first.id, categories(:category1).id
  end

  test "Test_update_When_given_update_group_Expect_pod_to_get_updated_correctly" do
    params = {
      account_id: accounts(:root).id,
      network_assignment_type: PodsHelper::PodAssignmentType::NoNetwork,
      update_group_id: update_groups(:main).id,
      location: { name: "New Location" }
    }
    put(client_path(clients(:pod1).unix_user), params: params, as: :html)
    assert_response :redirect
    updated_pod = clients(:pod1).reload
    assert_equal updated_pod.update_group.id, update_groups(:main).id
    assert_equal updated_pod.account.id, accounts(:root).id
    assert_equal updated_pod.user.id, users(:user1).id
  end
end